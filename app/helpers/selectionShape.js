// Connected selection (Material 3 Expressive, like the connected button
// groups): in the grid, the selected tiles next to each other read as one
// shape. A corner that faces another selected tile is nearly square, an
// outer corner stays round. Corners are a bit mask so tiles can compare
// them cheaply.

export const CORNER = { tl: 1, tr: 2, br: 4, bl: 8 };

// joined corners of the tile at [index] in a grid of [columns], where
// [isSelectedAt(i)] says whether the tile at i is selected; [count] is the
// number of tiles (the last row may be shorter)
export const joinedCorners = ({ index, columns, count, isSelectedAt }) => {
  const cols = Math.max(1, Math.floor(columns) || 1);
  const on = (i) => i >= 0 && i < count && isSelectedAt(i);

  if (!on(index)) {
    return 0;
  }

  const column = index % cols;
  const up = on(index - cols);
  const down = on(index + cols);
  const left = column > 0 && on(index - 1);
  const right = column < cols - 1 && on(index + 1);

  /* eslint-disable no-bitwise */
  return (
    (up || left ? CORNER.tl : 0) |
    (up || right ? CORNER.tr : 0) |
    (down || right ? CORNER.br : 0) |
    (down || left ? CORNER.bl : 0)
  );
  /* eslint-enable no-bitwise */
};

// CSS variables the tile's selected shape reads
export const cornerRadiusVars = (mask, outer, inner) => {
  /* eslint-disable no-bitwise */
  const r = (corner) => `${mask & corner ? inner : outer}px`;

  return {
    '--sel-tl': r(CORNER.tl),
    '--sel-tr': r(CORNER.tr),
    '--sel-br': r(CORNER.br),
    '--sel-bl': r(CORNER.bl),
  };
  /* eslint-enable no-bitwise */
};
