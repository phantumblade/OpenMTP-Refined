// Locale-aware helpers for the date range picker. Dates are exchanged as
// ISO "YYYY-MM-DD" strings (local calendar days), as the date filter expects.

const pad = (value) => String(value).padStart(2, '0');

export const toIsoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseIsoDate = (iso) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');

  if (!match) {
    return null;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

// Italian (and most of Europe) writes day/month/year and starts the week on
// Monday; English (US) writes month/day/year and starts on Sunday.
const LOCALES = {
  it: { order: 'dmy', placeholder: 'gg/mm/aaaa', weekStartsOn: 1 },
  en: { order: 'mdy', placeholder: 'mm/dd/yyyy', weekStartsOn: 0 },
};

const localeFor = (language) => LOCALES[language] || LOCALES.en;

export const datePlaceholder = (language) => localeFor(language).placeholder;

export const weekStartsOn = (language) => localeFor(language).weekStartsOn;

export const formatDisplayDate = (iso, language) => {
  const date = parseIsoDate(iso);

  if (!date) {
    return '';
  }

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return localeFor(language).order === 'dmy'
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
};

// Returns the ISO date, '' for an empty field or null when invalid.
export const parseDisplayDate = (text, language) => {
  const value = String(text || '').trim();

  if (!value) {
    return '';
  }

  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [first, second, year] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const [day, month] =
    localeFor(language).order === 'dmy' ? [first, second] : [second, first];
  const date = new Date(year, month - 1, day);

  // reject overflowing dates such as 31/02
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return toIsoDate(date);
};

export const quickRanges = (today = new Date()) => {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAgo = (count) =>
    toIsoDate(
      new Date(day.getFullYear(), day.getMonth(), day.getDate() - count)
    );
  const todayIso = toIsoDate(day);

  return {
    today: { from: todayIso, to: todayIso },
    last7Days: { from: daysAgo(6), to: todayIso },
    last30Days: { from: daysAgo(29), to: todayIso },
    thisYear: { from: `${day.getFullYear()}-01-01`, to: todayIso },
  };
};

// 6 weeks x 7 days covering [month] of [year], starting on the locale's
// first weekday.
export const monthMatrix = (year, month, firstWeekday = 1) => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - firstWeekday + 7) % 7;

  return Array.from(
    { length: 42 },
    (_, index) => new Date(year, month, 1 - offset + index)
  );
};
