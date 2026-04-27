const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_CHAT_ID;
const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

// Эскейп HTML — поскольку отправляем с parse_mode: 'HTML', любое имя/email
// с символами < > & может быть интерпретировано как теги. Атакующий мог бы
// через имя 'shop<a href="evil">click</a>' подсунуть админу фишинг-ссылку.
const escHtml = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));

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
      .map(i => `  ${escHtml(i.name || '?')} x ${Number(i.quantity) || 0} = ${((Number(i.price) || 0) * (Number(i.quantity) || 0)).toLocaleString('ru-RU')} сом`)
      .join('\n');

    const commission = Math.ceil(total * 0.05);

    const agentDisplay = data.agentRef
      ? `По реф. ссылке (${escHtml(data.agentRef)})`
      : 'Прямой клиент';

    // Сообщение для админа (вам)
    const adminMessage = `🛒 <b>Новый заказ!</b>\n\n` +
      `📦 <b>Поставщик:</b> ${escHtml(data.supplierName || 'Не указан')}\n` +
      `🏪 <b>Магазин:</b> ${escHtml(data.shopName || '')}\n` +
      `👤 <b>Агент:</b> ${agentDisplay}\n` +
      `📱 <b>Телефон:</b> ${escHtml(data.buyerPhone || '')}\n` +
      (data.city ? `🏙 <b>Город:</b> ${escHtml(data.city)}\n` : '') +
      `\n<b>Товары:</b>\n${itemsList}\n\n` +
      `💰 <b>Итого: ${total.toLocaleString('ru-RU')} сом</b>\n` +
      `💎 <b>Комиссия: ${commission} сом</b>`;

    // Сообщение для поставщика
    const supplierMessage = `🛒 <b>Новый заказ для вас!</b>\n\n` +
      `🏪 <b>Магазин:</b> ${escHtml(data.shopName || '')}\n` +
      `👤 <b>Покупатель:</b> ${escHtml(data.buyerName || '')}\n` +
      `📱 <b>Телефон:</b> ${escHtml(data.buyerPhone || '')}\n` +
      `📍 <b>Адрес:</b> ${escHtml(data.address || '')}\n\n` +
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

    // Сообщение покупателю — подтверждение приёма заказа
    if (data.buyerChatId) {
      const buyerMessage = `✅ <b>Ваш заказ принят!</b>\n\n` +
        `📦 <b>Поставщик:</b> ${escHtml(data.supplierName || '')}\n` +
        (data.expectedDelivery ? `🚚 <b>Ожидаемая доставка:</b> ${escHtml(data.expectedDelivery)}\n` : '') +
        `\n<b>Товары:</b>\n${itemsList}\n\n` +
        `💰 <b>Итого: ${total.toLocaleString('ru-RU')} сом</b>\n\n` +
        `📲 Мы пришлём сообщение когда заказ будет собран и отправлен.`;
      await sendMessage(data.buyerChatId, buyerMessage);
    }

    // Сохраняем в Google Таблицу с расширенными данными
    const agentCommission = data.agentRef ? Math.ceil(total * 0.01) : 0;
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
      `📧 <b>Email:</b> ${escHtml(data.email)}\n` +
      `👤 <b>Имя:</b> ${escHtml(data.name)}\n` +
      `📱 <b>Телефон:</b> ${escHtml(data.phone)}\n` +
      `🏷 <b>Роль:</b> ${escHtml(data.role)}` +
      (data.companyName ? `\n🏢 <b>Компания:</b> ${escHtml(data.companyName)}` : '') +
      (data.inn ? `\n📄 <b>ИНН:</b> ${escHtml(data.inn)}` : '') +
      (data.refCode ? `\n🎁 <b>Реф. код:</b> ${escHtml(data.refCode)}` : '');

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
        `🏪 <b>Магазин:</b> ${escHtml(data.shopName)}\n` +
        `📦 <b>Поставщик:</b> ${escHtml(data.supplierName)}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n\n` +
        `✅ Комиссия зафиксирована`;
    } else if (data.status === 'delivering') {
      message = `🚚 <b>Заказ отправлен!</b>\n\n` +
        `📦 <b>Заказ:</b> №${escHtml(data.orderId || '')}\n` +
        `👤 <b>Покупатель:</b> ${escHtml(data.buyerName || '')}\n` +
        `🏢 <b>Поставщик:</b> ${escHtml(data.supplierName || '')}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n\n` +
        `📍 Товар передан экспедитору`;
    } else if (data.status === 'not_received') {
      message = `❌ <b>Клиент НЕ получил заказ!</b>\n\n` +
        `🏪 <b>Магазин:</b> ${escHtml(data.shopName)}\n` +
        `📦 <b>Поставщик:</b> ${escHtml(data.supplierName)}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом\n` +
        (data.reason ? `📝 <b>Причина:</b> ${escHtml(data.reason)}\n` : '') +
        (data.buyerPhone ? `📱 <b>Телефон клиента:</b> ${escHtml(data.buyerPhone)}\n` : '') +
        `\n⚠️ <b>Разберитесь с ситуацией и решите — возвращать комиссию или нет</b>`;
    } else {
      message = `📋 <b>Статус заказа изменён</b>\n\n` +
        `🏪 <b>Магазин:</b> ${escHtml(data.shopName)}\n` +
        `📦 <b>Поставщик:</b> ${escHtml(data.supplierName)}\n` +
        `🔄 <b>Статус:</b> ${escHtml(statusMap[data.status] || data.status)}\n` +
        `💰 <b>Сумма:</b> ${Number(data.total || 0).toLocaleString('ru-RU')} сом`;
    }

    if (ADMIN_CHAT_ID) {
      await sendMessage(ADMIN_CHAT_ID, message);
    }

    // Сообщение покупателю — дружелюбные уведомления
    if (data.buyerChatId) {
      const safeOrderId = escHtml(data.orderId || '');
      const safeSupplier = escHtml(data.supplierName || '');
      const buyerMessages = {
        packed: `📦 <b>Ваш заказ собран!</b>\n\n` +
          `Заказ №${safeOrderId} от ${safeSupplier} готов к отправке.\n` +
          `Мы сообщим когда экспедитор выедет к вам.`,
        delivering: `🚚 <b>Экспедитор выехал с вашим заказом!</b>\n\n` +
          `Заказ №${safeOrderId} от ${safeSupplier}\n` +
          (data.driverPhone ? `📞 Контакт экспедитора: ${escHtml(data.driverPhone)}\n` : '') +
          `\nКогда получите — подтвердите в ответе на это сообщение: ✅ Получил / ❌ Не получил`,
        received: `✅ <b>Спасибо, что подтвердили получение!</b>\n\n` +
          `Заказ №${safeOrderId} закрыт.\n` +
          (data.coins ? `💎 Вам начислено ${Number(data.coins) || 0} монеток.\n` : '') +
          `Будем рады видеть вас снова!`,
        cancelled: `❌ <b>Заказ отменён</b>\n\n` +
          `Заказ №${safeOrderId} был отменён.\n` +
          (data.reason ? `Причина: ${escHtml(data.reason)}\n` : '') +
          `Если у вас вопросы — свяжитесь с нами.`,
      };
      const buyerMessage = buyerMessages[data.status];
      if (buyerMessage) {
        await sendMessage(data.buyerChatId, buyerMessage);
      }
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
