export const FILE_DATE_FIELD = Object.freeze({
  created: 'created',
  modified: 'modified',
});

export const EMPTY_FILE_DATE_FILTER = Object.freeze({
  field: FILE_DATE_FIELD.modified,
  from: '',
  to: '',
});

const parseLocalDayBoundary = (value, endOfDay = false) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const isFileDateFilterActive = (filter = EMPTY_FILE_DATE_FILTER) =>
  Boolean(filter.from || filter.to);

export const isFileDateFilterValid = (filter = EMPTY_FILE_DATE_FILTER) => {
  const from = filter.from ? parseLocalDayBoundary(filter.from) : null;
  const to = filter.to ? parseLocalDayBoundary(filter.to, true) : null;

  return from === null || to === null || from <= to;
};

export const getFileDateTimestamp = (item, field) => {
  const value =
    field === FILE_DATE_FIELD.created
      ? item.dateCreated
      : item.dateModified || item.dateAdded;
  const timestamp = value ? new Date(value).getTime() : Number.NaN;

  return Number.isNaN(timestamp) ? null : timestamp;
};

export const filterFileNodesByDate = (
  nodes = [],
  filter = EMPTY_FILE_DATE_FILTER
) => {
  if (!isFileDateFilterActive(filter) || !isFileDateFilterValid(filter)) {
    return nodes;
  }

  const from = filter.from ? parseLocalDayBoundary(filter.from) : null;
  const to = filter.to ? parseLocalDayBoundary(filter.to, true) : null;

  return nodes.filter((item) => {
    // Folders stay visible so a view filter never blocks navigation.
    if (item.isFolder) {
      return true;
    }

    const timestamp = getFileDateTimestamp(item, filter.field);

    if (timestamp === null) {
      return false;
    }

    return (
      (from === null || timestamp >= from) && (to === null || timestamp <= to)
    );
  });
};
