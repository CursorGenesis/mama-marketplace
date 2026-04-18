// =============================================
// ЭТОТ СКРИПТ НУЖНО ВСТАВИТЬ В GOOGLE APPS SCRIPT
// Инструкция ниже в комментариях
// =============================================

// 1. Откройте Google Таблицу (создайте новую: https://sheets.google.com)
// 2. Переименуйте первый лист в "Заказы"
// 3. Создайте ещё листы: "Поставщики", "Агенты", "Клиенты"
// 4. Нажмите: Расширения → Apps Script
// 5. Удалите весь код и вставьте этот скрипт
// 6. Нажмите: Развернуть → Новое развёртывание
// 7. Тип: Веб-приложение
// 8. Выполнять от: Меня
// 9. Доступ: Все
// 10. Нажмите "Развернуть" и скопируйте URL
// 11. Этот URL вставьте в .env.local как NEXT_PUBLIC_GOOGLE_SHEET_URL

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'order') {
      writeOrder(ss, data);
    } else if (data.type === 'registration') {
      writeRegistration(ss, data);
    } else if (data.type === 'status_update') {
      updateOrderStatus(ss, data);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeOrder(ss, data) {
  var sheet = ss.getSheetByName('Заказы');
  if (!sheet) {
    sheet = ss.insertSheet('Заказы');
    // Заголовки
    sheet.getRange(1, 1, 1, 14).setValues([[
      'Дата', 'Номер заказа', 'Магазин', 'Покупатель', 'Телефон', 'Адрес',
      'Поставщик', 'Товары', 'Сумма', 'Комиссия 5%', 'Агент', 'Комиссия агента 2%',
      'Монетки', 'Статус'
    ]]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var items = (data.items || []).map(function(i) {
    return i.name + ' x' + i.quantity + ' = ' + (i.price * i.quantity) + ' сом';
  }).join('; ');

  var total = data.totalPrice || 0;
  var commission = Math.ceil(total * 0.05);
  var agentCommission = data.agentRef ? Math.ceil(total * 0.02) : 0;
  var coins = Math.floor(total / 500);

  sheet.appendRow([
    new Date(),
    data.orderNumber || '',
    data.shopName || '',
    data.buyerName || '',
    data.buyerPhone || '',
    data.address || '',
    data.supplierName || '',
    items,
    total,
    commission,
    data.agentRef || 'Прямой',
    agentCommission,
    coins,
    'Новый'
  ]);
}

function writeRegistration(ss, data) {
  var sheet = ss.getSheetByName('Клиенты');
  if (!sheet) {
    sheet = ss.insertSheet('Клиенты');
    sheet.getRange(1, 1, 1, 8).setValues([[
      'Дата', 'Имя', 'Email', 'Телефон', 'Роль', 'Магазин/Компания', 'ИНН', 'Агент'
    ]]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.role || 'buyer',
    data.companyName || data.shopName || '',
    data.inn || '',
    data.refCode || 'Прямой'
  ]);
}

function updateOrderStatus(ss, data) {
  var sheet = ss.getSheetByName('Заказы');
  if (!sheet) return;

  // Ищем заказ по номеру в колонке B
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var orderNums = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < orderNums.length; i++) {
    if (orderNums[i][0] === data.orderId) {
      var statusMap = {
        packed: 'Собран', delivering: 'В доставке',
        received: 'Получено', not_received: 'Не получено',
        cancelled: 'Отменён'
      };
      sheet.getRange(i + 2, 14).setValue(statusMap[data.status] || data.status);
      if (data.reason) {
        sheet.getRange(i + 2, 14).setNote('Причина: ' + data.reason);
      }
      break;
    }
  }
}

// Автоматически создаёт листы при первом запуске
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Лист Заказы
  if (!ss.getSheetByName('Заказы')) {
    var s1 = ss.insertSheet('Заказы');
    s1.getRange(1, 1, 1, 14).setValues([[
      'Дата', 'Номер заказа', 'Магазин', 'Покупатель', 'Телефон', 'Адрес',
      'Поставщик', 'Товары', 'Сумма', 'Комиссия 5%', 'Агент', 'Комиссия агента 2%',
      'Монетки', 'Статус'
    ]]);
    s1.getRange(1, 1, 1, 14).setFontWeight('bold');
    s1.setFrozenRows(1);
  }

  // Лист Клиенты
  if (!ss.getSheetByName('Клиенты')) {
    var s2 = ss.insertSheet('Клиенты');
    s2.getRange(1, 1, 1, 8).setValues([[
      'Дата', 'Имя', 'Email', 'Телефон', 'Роль', 'Магазин/Компания', 'ИНН', 'Агент'
    ]]);
    s2.getRange(1, 1, 1, 8).setFontWeight('bold');
    s2.setFrozenRows(1);
  }

  // Лист Итоги
  if (!ss.getSheetByName('Итоги')) {
    var s3 = ss.insertSheet('Итоги');
    s3.getRange('A1').setValue('ИТОГИ MarketKG');
    s3.getRange('A1').setFontSize(16).setFontWeight('bold');

    s3.getRange('A3').setValue('Всего заказов:');
    s3.getRange('B3').setFormula('=COUNTA(Заказы!A2:A)');

    s3.getRange('A4').setValue('Общая сумма заказов:');
    s3.getRange('B4').setFormula('=SUM(Заказы!I2:I)');
    s3.getRange('B4').setNumberFormat('#,##0 "сом"');

    s3.getRange('A5').setValue('Доход платформы (комиссия 5%):');
    s3.getRange('B5').setFormula('=SUM(Заказы!J2:J)');
    s3.getRange('B5').setNumberFormat('#,##0 "сом"');

    s3.getRange('A6').setValue('Выплаты агентам (2%):');
    s3.getRange('B6').setFormula('=SUM(Заказы!L2:L)');
    s3.getRange('B6').setNumberFormat('#,##0 "сом"');

    s3.getRange('A7').setValue('Чистый доход:');
    s3.getRange('B7').setFormula('=B5-B6');
    s3.getRange('B7').setNumberFormat('#,##0 "сом"');
    s3.getRange('A7:B7').setFontWeight('bold');

    s3.getRange('A9').setValue('Всего клиентов:');
    s3.getRange('B9').setFormula('=COUNTA(Клиенты!A2:A)');

    s3.getRange('A10').setValue('Заказов за сегодня:');
    s3.getRange('B10').setFormula('=COUNTIF(Заказы!A2:A,TODAY())');

    s3.getRange('A12').setValue('Топ поставщики по сумме:');
    s3.setColumnWidth(1, 250);
    s3.setColumnWidth(2, 150);
  }
}
