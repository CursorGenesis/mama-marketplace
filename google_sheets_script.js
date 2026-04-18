// =============================================
// GOOGLE APPS SCRIPT ДЛЯ MARKETKG
// =============================================
// Инструкция:
// 1. Откройте Google Таблицу
// 2. Расширения → Apps Script
// 3. Удалите старый код, вставьте этот
// 4. Развернуть → Управление развёртываниями → Карандаш → Новая версия → Развернуть
// URL остаётся прежний!

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'order') {
      writeOrder(ss, data);
    } else if (data.type === 'registration') {
      writeRegistration(ss, data);
      // Если регистрируется покупатель с магазином — добавляем в Торговые точки
      if ((data.role === 'buyer') && (data.shopName || data.companyName)) {
        writeShop(ss, data);
      }
    } else if (data.type === 'status_update') {
      updateOrderStatus(ss, data);
      // Если не получен — записываем в Возвраты
      if (data.status === 'not_received') {
        writeRefund(ss, data);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// ЛИСТ "Заказы"
// =============================================
function writeOrder(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Заказы', [
    'Дата', 'Номер заказа', 'Магазин', 'Покупатель', 'Телефон', 'Адрес', 'Город',
    'Поставщик', 'Товары', 'Сумма', 'Комиссия 5%', 'Агент', 'Комиссия агента 2%',
    'Монетки', 'Статус', 'Дата сборки', 'Дата доставки', 'Дата получения'
  ]);

  var items = (data.items || []).map(function(i) {
    return i.name + ' x' + i.quantity + ' = ' + (i.price * i.quantity) + ' сом';
  }).join('; ');

  var total = Number(data.totalPrice || data.total || 0);
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
    data.city || '',
    data.supplierName || '',
    items,
    total,
    commission,
    data.agentRef || 'Прямой',
    agentCommission,
    coins,
    'Новый',
    '', '', ''
  ]);

  // Обновляем торговую точку — добавляем если новая, обновляем дату последнего заказа
  if (data.buyerPhone || data.shopName) {
    updateShopLastOrder(ss, data);
  }
}

// =============================================
// ЛИСТ "Клиенты"
// =============================================
function writeRegistration(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Клиенты', [
    'Дата', 'Имя', 'Email', 'Телефон', 'Роль', 'Магазин/Компания', 'ИНН', 'Город', 'Адрес', 'Агент'
  ]);

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.role || 'buyer',
    data.companyName || data.shopName || '',
    data.inn || '',
    data.city || '',
    data.address || '',
    data.refCode || 'Прямой'
  ]);

  // Покупатель с магазином/кафе — добавляем в базу контактов
  if (data.role === 'buyer' && (data.shopName || data.companyName)) {
    writeContactBase(ss, data, 'База клиентов');
  }

  // Поставщик — добавляем в базу поставщиков
  if (data.role === 'supplier') {
    writeSupplierBase(ss, data);
  }
}

// =============================================
// ЛИСТ "База клиентов" — только контакты
// =============================================
function writeContactBase(ss, data, sheetName) {
  var region = getRegion(data.city || '');
  var sheet = getOrCreateSheet(ss, sheetName, [
    'Название', 'Контактное лицо', 'Телефон', 'Email', 'WhatsApp',
    'Область', 'Город', 'Адрес', 'Вид деятельности', 'Агент', 'Дата регистрации'
  ]);

  // Проверяем дубликат по телефону
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var phones = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (var i = 0; i < phones.length; i++) {
      if (phones[i][0] === (data.phone || '')) return;
    }
  }

  var bizType = detectBusinessType(data.shopName || data.companyName || '');

  sheet.appendRow([
    data.shopName || data.companyName || '',
    data.name || '',
    data.phone || '',
    data.email || '',
    data.whatsapp || data.phone || '',
    region,
    data.city || '',
    data.address || '',
    bizType,
    data.refCode || 'Прямой',
    new Date()
  ]);
}

// =============================================
// ЛИСТ "База поставщиков" — контакты + категория
// =============================================
function writeSupplierBase(ss, data) {
  var region = getRegion(data.city || '');
  var sheet = getOrCreateSheet(ss, 'База поставщиков', [
    'Компания', 'Контактное лицо', 'Телефон', 'Email', 'WhatsApp',
    'ИНН', 'Область', 'Город', 'Адрес', 'Категория товаров', 'Дата регистрации'
  ]);

  // Проверяем дубликат по ИНН или телефону
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var existing = sheet.getRange(2, 3, lastRow - 1, 4).getValues(); // телефон, email, whatsapp, ИНН
    for (var i = 0; i < existing.length; i++) {
      if (existing[i][0] === (data.phone || '') ||
          (data.inn && sheet.getRange(i + 2, 6).getValue() === data.inn)) return;
    }
  }

  var categoryMap = {
    confectionery: 'Кондитерка', drinks: 'Напитки', grocery: 'Бакалея',
    dairy: 'Молочные продукты', meat: 'Мясо и птица', fruits: 'Фрукты и овощи',
    frozen: 'Заморозка', snacks: 'Снеки', bakery: 'Хлеб и выпечка',
    oils: 'Масла и соусы', eggs: 'Яйца', tea_coffee: 'Чай и кофе',
    canned: 'Консервы', spices: 'Специи', baby: 'Детское питание',
    tobacco: 'Табак', disposable: 'Одноразовая посуда', pet_food: 'Корма',
    alcohol: 'Алкоголь', hardware: 'Хозтовары', stationery: 'Канцтовары',
    textile: 'Текстиль', hygiene: 'Гигиена', honey: 'Мёд и варенье',
    dried_fruits: 'Сухофрукты и орехи', household: 'Бытовая химия', other: 'Другое'
  };

  sheet.appendRow([
    data.companyName || data.name || '',
    data.name || '',
    data.phone || '',
    data.email || '',
    data.whatsapp || data.phone || '',
    data.inn || '',
    region,
    data.city || '',
    data.address || '',
    categoryMap[data.category] || data.category || '',
    new Date()
  ]);
}

// =============================================
// ОПРЕДЕЛЕНИЕ ОБЛАСТИ ПО ГОРОДУ
// =============================================
function getRegion(city) {
  var regions = {
    'Бишкек': 'г. Бишкек',
    'Ош': 'Ошская область',
    'Токмок': 'Чуйская область',
    'Каракол': 'Иссык-Кульская область',
    'Балыкчы': 'Иссык-Кульская область',
    'Нарын': 'Нарынская область',
    'Талас': 'Таласская область',
    'Баткен': 'Баткенская область',
    'Кызыл-Кия': 'Баткенская область',
    'Манас': 'Чуйская область',
  };
  return regions[city] || '';
}

// =============================================
// ОПРЕДЕЛЕНИЕ ВИДА ДЕЯТЕЛЬНОСТИ ПО НАЗВАНИЮ
// =============================================
function detectBusinessType(name) {
  var lower = name.toLowerCase();
  if (lower.indexOf('кафе') >= 0 || lower.indexOf('ресторан') >= 0 || lower.indexOf('столовая') >= 0) return 'Общепит';
  if (lower.indexOf('аптек') >= 0) return 'Аптека';
  if (lower.indexOf('супермаркет') >= 0 || lower.indexOf('гипермаркет') >= 0) return 'Супермаркет';
  if (lower.indexOf('мини') >= 0 || lower.indexOf('маркет') >= 0 || lower.indexOf('магазин') >= 0 || lower.indexOf('дүкөн') >= 0) return 'Магазин';
  if (lower.indexOf('оптов') >= 0 || lower.indexOf('база') >= 0 || lower.indexOf('склад') >= 0) return 'Оптовая база';
  if (lower.indexOf('пекарн') >= 0 || lower.indexOf('кондитер') >= 0) return 'Пекарня/Кондитерская';
  if (lower.indexOf('отель') >= 0 || lower.indexOf('гостиниц') >= 0) return 'Гостиница';
  return 'Торговая точка';
}

// =============================================
// ЛИСТ "Торговые точки"
// =============================================
function writeShop(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Торговые точки', [
    'Дата регистрации', 'Название', 'Контактное лицо', 'Телефон', 'Email',
    'Город', 'Адрес', 'Агент', 'Кол-во заказов', 'Сумма заказов', 'Последний заказ'
  ]);

  // Проверяем нет ли уже такой точки (по телефону)
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var phones = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    for (var i = 0; i < phones.length; i++) {
      if (phones[i][0] === (data.phone || '')) return; // уже есть
    }
  }

  sheet.appendRow([
    new Date(),
    data.shopName || data.companyName || '',
    data.name || '',
    data.phone || '',
    data.email || '',
    data.city || '',
    data.address || '',
    data.refCode || 'Прямой',
    0,
    0,
    ''
  ]);
}

function updateShopLastOrder(ss, data) {
  var sheet = ss.getSheetByName('Торговые точки');
  if (!sheet) {
    // Создаём и добавляем точку
    writeShop(ss, {
      shopName: data.shopName || data.buyerName || '',
      name: data.buyerName || '',
      phone: data.buyerPhone || '',
      email: data.buyerEmail || '',
      city: data.city || '',
      address: data.address || '',
      refCode: data.agentRef || 'Прямой'
    });
    sheet = ss.getSheetByName('Торговые точки');
    if (!sheet) return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // Нет записей — добавляем
    sheet.appendRow([
      new Date(),
      data.shopName || data.buyerName || '',
      data.buyerName || '',
      data.buyerPhone || '',
      data.buyerEmail || '',
      data.city || '',
      data.address || '',
      data.agentRef || 'Прямой',
      1,
      Number(data.totalPrice || data.total || 0),
      new Date()
    ]);
    return;
  }

  var phones = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
  var found = false;
  var total = Number(data.totalPrice || data.total || 0);

  for (var i = 0; i < phones.length; i++) {
    if (phones[i][0] === (data.buyerPhone || '')) {
      var row = i + 2;
      var currentOrders = Number(sheet.getRange(row, 9).getValue()) || 0;
      var currentTotal = Number(sheet.getRange(row, 10).getValue()) || 0;
      sheet.getRange(row, 9).setValue(currentOrders + 1);
      sheet.getRange(row, 10).setValue(currentTotal + total);
      sheet.getRange(row, 11).setValue(new Date());
      // Обновляем название если пустое
      if (!sheet.getRange(row, 2).getValue() && data.shopName) {
        sheet.getRange(row, 2).setValue(data.shopName);
      }
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([
      new Date(),
      data.shopName || data.buyerName || '',
      data.buyerName || '',
      data.buyerPhone || '',
      data.buyerEmail || '',
      data.city || '',
      data.address || '',
      data.agentRef || 'Прямой',
      1,
      total,
      new Date()
    ]);
  }
}

// =============================================
// ЛИСТ "Возвраты"
// =============================================
function writeRefund(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Возвраты', [
    'Дата', 'Номер заказа', 'Магазин', 'Поставщик', 'Сумма',
    'Комиссия возвращена', 'Причина', 'Телефон покупателя'
  ]);

  var total = Number(data.total || 0);
  var commission = Math.ceil(total * 0.05);

  sheet.appendRow([
    new Date(),
    data.orderId || '',
    data.shopName || '',
    data.supplierName || '',
    total,
    commission,
    data.reason || '',
    data.buyerPhone || ''
  ]);
}

// =============================================
// ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА
// =============================================
function updateOrderStatus(ss, data) {
  var sheet = ss.getSheetByName('Заказы');
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var orderNums = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  var statusMap = {
    packed: 'Собран', delivering: 'В доставке',
    received: 'Получено', not_received: 'Не получено',
    cancelled: 'Отменён'
  };

  for (var i = 0; i < orderNums.length; i++) {
    if (orderNums[i][0] === data.orderId) {
      var row = i + 2;
      // Колонка O (15) — Статус
      sheet.getRange(row, 15).setValue(statusMap[data.status] || data.status);

      // Даты по статусам
      if (data.status === 'packed') {
        sheet.getRange(row, 16).setValue(new Date()); // Дата сборки
      } else if (data.status === 'delivering') {
        sheet.getRange(row, 17).setValue(new Date()); // Дата доставки
      } else if (data.status === 'received' || data.status === 'not_received') {
        sheet.getRange(row, 18).setValue(new Date()); // Дата получения
      }

      if (data.reason) {
        sheet.getRange(row, 15).setNote('Причина: ' + data.reason);
      }
      break;
    }
  }
}

// =============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
// =============================================
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#f0f0f0');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// =============================================
// ПЕРВОНАЧАЛЬНАЯ НАСТРОЙКА (запустить 1 раз)
// =============================================
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Заказы
  getOrCreateSheet(ss, 'Заказы', [
    'Дата', 'Номер заказа', 'Магазин', 'Покупатель', 'Телефон', 'Адрес', 'Город',
    'Поставщик', 'Товары', 'Сумма', 'Комиссия 5%', 'Агент', 'Комиссия агента 2%',
    'Монетки', 'Статус', 'Дата сборки', 'Дата доставки', 'Дата получения'
  ]);

  // Клиенты
  getOrCreateSheet(ss, 'Клиенты', [
    'Дата', 'Имя', 'Email', 'Телефон', 'Роль', 'Магазин/Компания', 'ИНН', 'Город', 'Адрес', 'Агент'
  ]);

  // Торговые точки
  getOrCreateSheet(ss, 'Торговые точки', [
    'Дата регистрации', 'Название', 'Контактное лицо', 'Телефон', 'Email',
    'Город', 'Адрес', 'Агент', 'Кол-во заказов', 'Сумма заказов', 'Последний заказ'
  ]);

  // Возвраты
  getOrCreateSheet(ss, 'Возвраты', [
    'Дата', 'Номер заказа', 'Магазин', 'Поставщик', 'Сумма',
    'Комиссия возвращена', 'Причина', 'Телефон покупателя'
  ]);

  // База клиентов (только контакты)
  getOrCreateSheet(ss, 'База клиентов', [
    'Название', 'Контактное лицо', 'Телефон', 'Email', 'WhatsApp',
    'Область', 'Город', 'Адрес', 'Вид деятельности', 'Агент', 'Дата регистрации'
  ]);

  // База поставщиков (только контакты)
  getOrCreateSheet(ss, 'База поставщиков', [
    'Компания', 'Контактное лицо', 'Телефон', 'Email', 'WhatsApp',
    'ИНН', 'Область', 'Город', 'Адрес', 'Категория товаров', 'Дата регистрации'
  ]);

  // Агенты (сводная — формулы)
  var agentSheet = getOrCreateSheet(ss, 'Агенты', [
    'Агент', 'Кол-во заказов', 'Сумма заказов', 'Комиссия 2%', 'Кол-во магазинов'
  ]);
  agentSheet.getRange('A2').setValue('Формулы подтягиваются автоматически');
  agentSheet.getRange('A2').setFontStyle('italic').setFontColor('#999');
  // Уникальные агенты из заказов
  agentSheet.getRange('A4').setValue('=SORT(UNIQUE(Заказы!L2:L))');
  agentSheet.getRange('B4').setFormula('=IF(A4="","",COUNTIF(Заказы!L:L,A4))');
  agentSheet.getRange('C4').setFormula('=IF(A4="","",SUMIF(Заказы!L:L,A4,Заказы!J:J))');
  agentSheet.getRange('D4').setFormula('=IF(A4="","",SUMIF(Заказы!L:L,A4,Заказы!M:M))');
  agentSheet.getRange('E4').setFormula('=IF(A4="","",COUNTIF(\'Торговые точки\'!H:H,A4))');

  // Поставщики (сводная — формулы)
  var supSheet = getOrCreateSheet(ss, 'Поставщики', [
    'Поставщик', 'Кол-во заказов', 'Сумма заказов', 'Комиссия 5%'
  ]);
  supSheet.getRange('A2').setValue('Формулы подтягиваются автоматически');
  supSheet.getRange('A2').setFontStyle('italic').setFontColor('#999');
  supSheet.getRange('A4').setValue('=SORT(UNIQUE(Заказы!H2:H))');
  supSheet.getRange('B4').setFormula('=IF(A4="","",COUNTIF(Заказы!H:H,A4))');
  supSheet.getRange('C4').setFormula('=IF(A4="","",SUMIF(Заказы!H:H,A4,Заказы!J:J))');
  supSheet.getRange('D4').setFormula('=IF(A4="","",SUMIF(Заказы!H:H,A4,Заказы!K:K))');

  // По месяцам
  var monthSheet = getOrCreateSheet(ss, 'По месяцам', [
    'Месяц', 'Заказов', 'Сумма', 'Комиссия 5%', 'Комиссия агентов 2%', 'Чистый доход', 'Возвратов'
  ]);
  monthSheet.getRange('A2').setValue('Формулы подтягиваются автоматически');
  monthSheet.getRange('A2').setFontStyle('italic').setFontColor('#999');

  // Итоги
  var itogSheet = getOrCreateSheet(ss, 'Итоги', ['Показатель', 'Значение']);

  itogSheet.getRange('A1').setValue('ИТОГИ MarketKG');
  itogSheet.getRange('A1').setFontSize(16).setFontWeight('bold');

  itogSheet.getRange('A3').setValue('Всего заказов:');
  itogSheet.getRange('B3').setFormula('=COUNTA(Заказы!A2:A)');

  itogSheet.getRange('A4').setValue('Общая сумма заказов:');
  itogSheet.getRange('B4').setFormula('=SUM(Заказы!J2:J)');
  itogSheet.getRange('B4').setNumberFormat('#,##0 "сом"');

  itogSheet.getRange('A5').setValue('Доход платформы (комиссия 5%):');
  itogSheet.getRange('B5').setFormula('=SUM(Заказы!K2:K)');
  itogSheet.getRange('B5').setNumberFormat('#,##0 "сом"');

  itogSheet.getRange('A6').setValue('Выплаты агентам (2%):');
  itogSheet.getRange('B6').setFormula('=SUM(Заказы!M2:M)');
  itogSheet.getRange('B6').setNumberFormat('#,##0 "сом"');

  itogSheet.getRange('A7').setValue('Чистый доход:');
  itogSheet.getRange('B7').setFormula('=B5-B6');
  itogSheet.getRange('B7').setNumberFormat('#,##0 "сом"');
  itogSheet.getRange('A7:B7').setFontWeight('bold').setFontColor('#0a7e0a');

  itogSheet.getRange('A9').setValue('Всего клиентов:');
  itogSheet.getRange('B9').setFormula('=COUNTA(Клиенты!A2:A)');

  itogSheet.getRange('A10').setValue('Торговых точек:');
  itogSheet.getRange('B10').setFormula('=COUNTA(\'Торговые точки\'!A2:A)');

  itogSheet.getRange('A11').setValue('Агентов:');
  itogSheet.getRange('B11').setFormula('=COUNTIF(Клиенты!E:E,"agent")');

  itogSheet.getRange('A12').setValue('Поставщиков:');
  itogSheet.getRange('B12').setFormula('=COUNTIF(Клиенты!E:E,"supplier")');

  itogSheet.getRange('A14').setValue('Возвратов:');
  itogSheet.getRange('B14').setFormula('=COUNTA(Возвраты!A2:A)');

  itogSheet.getRange('A15').setValue('Сумма возвратов:');
  itogSheet.getRange('B15').setFormula('=SUM(Возвраты!E2:E)');
  itogSheet.getRange('B15').setNumberFormat('#,##0 "сом"');

  itogSheet.getRange('A17').setValue('Заказов за сегодня:');
  itogSheet.getRange('B17').setFormula('=COUNTIF(Заказы!A2:A,TODAY())');

  itogSheet.getRange('A18').setValue('Сумма за сегодня:');
  itogSheet.getRange('B18').setFormula('=SUMIF(Заказы!A2:A,TODAY(),Заказы!J2:J)');
  itogSheet.getRange('B18').setNumberFormat('#,##0 "сом"');

  itogSheet.setColumnWidth(1, 280);
  itogSheet.setColumnWidth(2, 150);
}
