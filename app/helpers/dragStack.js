// The stack that follows the pointer while files are dragged between the
// panes (components/DragStack). The panes tell it what happens through
// these calls; the transfer dialog takes it over on a drop.

const listeners = new Set();

const emit = (type, payload) => {
  listeners.forEach((listener) => listener(type, payload));
};

export const subscribeDragStack = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

// a drag of the selection starts: [icons] are the image sources of the
// first selected items, [count] how many there are, [bytes] their size when
// it's known (files only), [from] the rect of the first one
export const beginDragStack = (payload) => emit('begin', payload);

// dropped on the other pane: the stack waits for the transfer dialog
export const dropDragStack = () => emit('drop');

// the drag ended without a drop: the stack goes back to the selection
export const endDragStack = () => emit('end');

// the transfer dialog opens: the stack flies into [rect] and disappears
// there. Returns true if a dropped stack was waiting for it.
let waiting = false;

export const setDragStackWaiting = (value) => {
  waiting = value;
};

export const handOffDragStack = (rect) => {
  if (!waiting) {
    return false;
  }

  waiting = false;
  emit('handoff', rect);

  return true;
};
