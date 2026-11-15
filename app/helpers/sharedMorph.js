// One-shot origins for shared-element motion between two parts of the UI
// that don't know about each other: the side that starts the motion leaves
// a rect under a key, the side that appears takes it (once) and grows from
// it. Used by the transfer dialog (from the dropped stack or from the
// background pill) and by the pill (from the dialog).

const pending = new Map();

export const setMorphOrigin = (key, origin) => {
  pending.set(key, { ...origin, at: Date.now() });
};

export const takeMorphOrigin = (key, maxAgeMs = 1500) => {
  const origin = pending.get(key);

  pending.delete(key);

  return origin && Date.now() - origin.at <= maxAgeMs ? origin : null;
};

// a DOMRect as plain numbers (it can be stored and compared later)
export const plainRect = (rect) =>
  rect
    ? {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    : null;

// transform that puts an element laid out at [box] over [rect]
export const flipTransform = (rect, box) =>
  `translate(${rect.left + rect.width / 2 - (box.left + box.width / 2)}px, ${
    rect.top + rect.height / 2 - (box.top + box.height / 2)
  }px) scale(${rect.width / box.width}, ${rect.height / box.height})`;
