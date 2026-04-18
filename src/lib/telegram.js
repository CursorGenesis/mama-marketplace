const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_CHAT_ID;
const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Telegram send error:', err);
  }
}

export async function sendTelegramNotification(type, data) {
  if (!BOT_TOKEN) return;

  if (type === 'new_order') {
    const total = Number(data.total || data.totalPrice || 0);
    const itemsList = (data.items || [])
      .map(i => `  ${i.name || '?'} x ${i.quantity || 0} = ${((i.price || 0) * (i.quantity || 0)).toLocaleString('ru-RU')} сом`)
      .join('\n');

    const commission = Math.ceil(total * 0.05);

    // Сообщение для админа (вам)
    const adminMessage = `🛒 <b>Новый заказ!</b>\n\n` +
      `📦 <b>Поставщик:</b> ${data.supplierName || 'Не указан'}\n` +
      `🏪 <b>Магазин:</b> ${data.shopName || ''}\n` +
      `👤 <b>Агент:</b> ${data.agentName || 'Прямой'}\n` +
      `📱 <b>Телефон:</b> ${data.buyerPhone || ''}\n\n` +
      `<b>Товары:</b>\n${itemsList}\n\n` +
      `💰 <b>Итого: ${total.toLocaleString('ru-RU')} сом</b>\n` +
      `💎 <b>Комиссия: ${commission} сом</b>`;

    // Сообщение для поставщика
    const supplierMessage = `🛒 <b>Новый заказ для вас!</b>\n\n` +
      `🏪 <b>Магазин:</b> ${data.shopName || ''}\n` +
      `👤 <b>Покупатель:</b> ${data.buyerName || ''}\n` +
      `📱 <b>Телефон:</b> ${data.buyerPhone || ''}\n` +
      `📍 <b>Адрес:</b> ${data.address || ''}\n\n` +
      `<b>Товары:</b>\n${itemsList}\n\n` +
      `💰 <b>Итого: ${total.toLocaleString('ru-RU')} сом</b>\n\n` +
      `📞 Свяжитесь с покупателем для подтверждения`;

    // Отправляем админу
    if (ADMIN_CHAT_ID) {
      await sendMessage(ADMIN_CHAT_ID, adminMessage);
    }

    // Отправляем поставщику если у него есть Telegram chat_id
    if (data.supplierChatId) {
      await sendMessage(data.supplierChatId, supplierMessage);
    }

    // Сохраняем в Google Таблицу с расширенными данными
    const agentCommission = data.agentRef ? Math.ceil(total * 0.02) : 0;
    const coins = Math.floor(total / 500);
    sendToGoogleSheet({
      type: 'order',
      ...data,
      commission,
      agentRef: data.agentRef || '',
      agentCommission,
      coins,
    });
  }

  if (type === 'new_registration') {
    const message = `👤 <b>Новая регистрация!</b>\n\n` +
      `📧 <b>Email:</b> ${data.email}\n` +
      `👤 <b>Имя:</b> ${data.name}\n` +
      `📱 <b>Телефон:</b> ${data.phone}\n` +
      `🏷 <b>Роль:</b> ${data.role}` +
      (data.companyName ? `\n🏢 <b>Компания:</b> ${data.companyName}` : '') +
      (data.inn ? `\n📄 <b>ИНН:</b> ${data.inn}` : '') +
      (data.refCode ? `\n🎁 <b>Реф. код:</b> ${data.refCode}` : '');

    if (ADMIN_CHAT_ID) {
      await sendMessage(ADMIN_CHAT_ID, message);
    }

    // Сохраняем регистрацию в Google Таблицу
    sendToGoogleSheet({ type: 'registration', ...data });
  }

  if (type === 'order_status') {
    const statusMap = {
      packed: '📦 Собран',
      delivering: '🚚 В доставке',
      received: '✅ Клиент подтвердил получение',
      not_received: '❌ Клиент НЕ получил заказ',
      cancelled: '❌ Отменён',
    };

    let message = '';

    if (data.status === 'received') {
      message = `✅ <b>Клиент подтвердил доставку!</b>\n\n` +
        `🏪 <b>Магазин:</b> ${data.shopName}\n` +
        `📦 <b>Поставщик:</b> ${data.supplierName}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n\n` +
        `✅ Комиссия зафиксирована`;
    } else if (data.status === 'delivering') {
      message = `🚚 <b>Заказ отправлен!</b>\n\n` +
        `📦 <b>Заказ:</b> №${data.orderId || ''}\n` +
        `👤 <b>Покупатель:</b> ${data.buyerName || ''}\n` +
        `🏢 <b>Поставщик:</b> ${data.supplierName || ''}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n\n` +
        `📍 Товар передан экспедитору`;
    } else if (data.status === 'not_received') {
      message = `❌ <b>Клиент НЕ получил заказ!</b>\n\n` +
        `🏪 <b>Магазин:</b> ${data.shopName}\n` +
        `📦 <b>Поставщик:</b> ${data.supplierName}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n` +
        (data.reason ? `📝 <b>Причина:</b> ${data.reason}\n` : '') +
        (data.buyerPhone ? `📱 <b>Телефон клиента:</b> ${data.buyerPhone}\n` : '') +
        `\n⚠️ <b>Разберитесь с ситуацией и решите — возвращать комиссию или нет</b>`;
    } else {
      message = `📋 <b>Статус заказа изменён</b>\n\n` +
        `🏪 <b>Магазин:</b> ${data.shopName}\n` +
        `📦 <b>Поставщик:</b> ${data.supplierName}\n` +
        `🔄 <b>Статус:</b> ${statusMap[data.status] || data.status}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом`;
    }

    if (ADMIN_CHAT_ID) {
      await sendMessage(ADMIN_CHAT_ID, message);
    }

    // Обновляем статус в Google Таблице
    sendToGoogleSheet({ type: 'status_update', orderId: data.orderId, status: data.status, reason: data.reason || '' });
  }
}

// Google Sheets — отправка данных в таблицу
function sendToGoogleSheet(data) {
  if (!GOOGLE_SHEET_URL) return;
  try {
    fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch (e) {
    console.error('Google Sheet error:', e);
  }
}
