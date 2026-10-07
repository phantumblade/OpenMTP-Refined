import React, { useRef } from 'react';
import { Transition } from 'react-transition-group';
import { useForkRef } from '@material-ui/core/utils';

// Material 3 dialog motion, as implemented by Material Web
// (dialog/internal/animations.ts): the dialog slides down 50px while its
// container grows from 35% to full height (500ms, emphasized easing); the
// headline and content fade in a little later and the actions last. Closing
// reverses it in 150ms with the emphasized-accelerate easing.

const EMPHASIZED = 'cubic-bezier(0.3, 0, 0, 1)';
const EMPHASIZED_ACCELERATE = 'cubic-bezier(0.3, 0, 0.8, 0.15)';

export const DIALOG_ENTER_MS = 500;
export const DIALOG_EXIT_MS = 150;
const COLLAPSED_CLIP = 'inset(0 0 65% 0 round 28px)';
const FULL_CLIP = 'inset(0 0 0% 0 round 28px)';

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sectionsOf = (paper) => (paper ? Array.from(paper.children) : []);

const animateIn = (node) => {
  const paper = node.firstElementChild;

  if (!paper || typeof paper.animate !== 'function') {
    return;
  }

  if (prefersReducedMotion()) {
    paper.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });

    return;
  }

  node.animate(
    [{ transform: 'translateY(-50px)' }, { transform: 'translateY(0)' }],
    { duration: DIALOG_ENTER_MS, easing: EMPHASIZED }
  );
  paper.animate([{ clipPath: COLLAPSED_CLIP }, { clipPath: FULL_CLIP }], {
    duration: DIALOG_ENTER_MS,
    easing: EMPHASIZED,
  });
  paper.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 50,
    easing: 'linear',
  });

  const sections = sectionsOf(paper);

  sections.forEach((section, index) => {
    const isActions = index === sections.length - 1 && sections.length > 1;

    section.animate(
      [
        { opacity: 0 },
        { opacity: 0, offset: isActions ? 0.5 : 0.2 },
        { opacity: 1 },
      ],
      { duration: isActions ? 300 : 250, easing: 'linear' }
    );
  });
};

const animateOut = (node) => {
  const paper = node.firstElementChild;

  if (!paper || typeof paper.animate !== 'function') {
    return;
  }

  const options = { duration: DIALOG_EXIT_MS, fill: 'forwards' };

  if (prefersReducedMotion()) {
    paper.animate([{ opacity: 1 }, { opacity: 0 }], options);

    return;
  }

  node.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-50px)' }],
    { ...options, easing: EMPHASIZED_ACCELERATE }
  );
  paper.animate([{ clipPath: FULL_CLIP }, { clipPath: COLLAPSED_CLIP }], {
    ...options,
    easing: EMPHASIZED_ACCELERATE,
  });
  paper.animate([{ opacity: 1 }, { opacity: 0 }], {
    delay: 100,
    duration: 50,
    easing: 'linear',
    fill: 'forwards',
  });
  sectionsOf(paper).forEach((section) => {
    section.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 100,
      easing: 'linear',
      fill: 'forwards',
    });
  });
};

// Drop-in replacement for MUI's Fade as the Dialog TransitionComponent.
const M3DialogTransition = React.forwardRef(function M3DialogTransition(
  props,
  ref
) {
  const {
    children,
    in: inProp,
    appear = true,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
    style,
    // MUI passes its own durations; the motion spec fixes them
    timeout: _timeout,
    ...other
  } = props;
  const nodeRef = useRef(null);
  const handleRef = useForkRef(children.ref, useForkRef(nodeRef, ref));
  const call = (callback) => (isAppearing) => {
    if (callback) {
      callback(nodeRef.current, isAppearing);
    }
  };

  return (
    <Transition
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      timeout={{ enter: DIALOG_ENTER_MS, exit: DIALOG_EXIT_MS }}
      onEnter={(isAppearing) => {
        // cancel a running close animation (reopened quickly)
        nodeRef.current
          ?.getAnimations?.({ subtree: true })
          .forEach((animation) => animation.cancel());
        animateIn(nodeRef.current);
        call(onEnter)(isAppearing);
      }}
      onEntering={call(onEntering)}
      onEntered={call(onEntered)}
      onExit={() => {
        animateOut(nodeRef.current);
        call(onExit)();
      }}
      onExiting={call(onExiting)}
      onExited={() => {
        nodeRef.current
          ?.getAnimations?.({ subtree: true })
          .forEach((animation) => animation.cancel());
        call(onExited)();
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {(state) =>
        React.cloneElement(children, {
          ref: handleRef,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...style,
            ...children.props.style,
          },
        })
      }
    </Transition>
  );
});

export default M3DialogTransition;
