// Расчёт ближайшей даты доставки для города по графику поставщика
// schedule: { "Бишкек": [1,2,3,4,5], "Ош": [2,5] } — индексы: 0=Вс, 1=Пн... 6=Сб
export function getNextDeliveryDate(schedule, city, fromDate = new Date()) {
  if (!schedule || !city) return null;
  const days = schedule[city];
  if (!days || days.length === 0) return null;

  for (let i = 0; i < 14; i++) {
    const check = new Date(fromDate);
    check.setDate(check.getDate() + i);
    if (days.includes(check.getDay())) {
      return check;
    }
  }
  return null;
}

export function formatDeliveryDate(date, lang = 'ru') {
  if (!date) return '';
  const daysRu = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const daysKg = ['жекшемби', 'дүйшөмбү', 'шейшемби', 'шаршемби', 'бейшемби', 'жума', 'ишемби'];
  const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const monthsKg = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d - today) / (1000 * 60 * 60 * 24));

  const dayName = lang === 'kg' ? daysKg[date.getDay()] : daysRu[date.getDay()];
  const monthName = lang === 'kg' ? monthsKg[date.getMonth()] : monthsRu[date.getMonth()];
  const dateStr = `${dayName}, ${date.getDate()} ${monthName}`;

  if (diffDays === 0) return lang === 'kg' ? `бүгүн (${dateStr})` : `сегодня (${dateStr})`;
  if (diffDays === 1) return lang === 'kg' ? `эртең (${dateStr})` : `завтра (${dateStr})`;
  return dateStr;
}
