const normalisePositiveNumber = (value, fallback) => {
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

// Math.max(0, NaN) is NaN, so undefined DOM measurements (element not mounted
// yet) would otherwise propagate NaN into the rendered window.
const normaliseNonNegativeNumber = (value) => {
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export const calculateListWindow = ({
  itemCount,
  scrollOffset,
  viewportSize,
  itemSize,
  overscan = 6,
}) => {
  const safeItemCount = Math.floor(normaliseNonNegativeNumber(itemCount));
  const safeItemSize = normalisePositiveNumber(itemSize, 1);
  const safeViewportSize = normaliseNonNegativeNumber(viewportSize);
  const safeScrollOffset = normaliseNonNegativeNumber(scrollOffset);
  const safeOverscan = normaliseNonNegativeNumber(overscan);
  const firstVisibleIndex = Math.min(
    Math.max(0, safeItemCount - 1),
    Math.floor(safeScrollOffset / safeItemSize)
  );
  const visibleItemCount = Math.ceil(safeViewportSize / safeItemSize);
  const startIndex = Math.max(0, firstVisibleIndex - safeOverscan);
  const endIndex = Math.min(
    safeItemCount,
    firstVisibleIndex + visibleItemCount + safeOverscan
  );

  return {
    startIndex,
    endIndex,
    beforeSize: startIndex * safeItemSize,
    afterSize: Math.max(0, (safeItemCount - endIndex) * safeItemSize),
  };
};

export const calculateGridWindow = ({
  itemCount,
  scrollOffset,
  viewportSize,
  containerSize,
  itemWidth,
  itemHeight,
  overscanRows = 3,
}) => {
  const safeItemCount = Math.floor(normaliseNonNegativeNumber(itemCount));
  const safeItemWidth = normalisePositiveNumber(itemWidth, 1);
  const safeItemHeight = normalisePositiveNumber(itemHeight, 1);
  const columns = Math.max(
    1,
    Math.floor(normaliseNonNegativeNumber(containerSize) / safeItemWidth)
  );
  const totalRows = Math.ceil(safeItemCount / columns);
  const safeScrollOffset = normaliseNonNegativeNumber(scrollOffset);
  const safeViewportSize = normaliseNonNegativeNumber(viewportSize);
  const safeOverscanRows = normaliseNonNegativeNumber(overscanRows);
  const firstVisibleRow = Math.min(
    Math.max(0, totalRows - 1),
    Math.floor(safeScrollOffset / safeItemHeight)
  );
  const visibleRowCount = Math.ceil(safeViewportSize / safeItemHeight);
  const startRow = Math.max(0, firstVisibleRow - safeOverscanRows);
  const endRow = Math.min(
    totalRows,
    firstVisibleRow + visibleRowCount + safeOverscanRows
  );

  return {
    columns,
    startIndex: startRow * columns,
    endIndex: Math.min(safeItemCount, endRow * columns),
    beforeSize: startRow * safeItemHeight,
    afterSize: Math.max(0, (totalRows - endRow) * safeItemHeight),
  };
};
