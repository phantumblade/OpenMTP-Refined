import React from 'react';
import PropTypes from 'prop-types';
// The legacy ESLint resolver cannot read package export maps.
// eslint-disable-next-line import/no-unresolved
import { SlotText as AnimatedSlotText } from 'slot-text/react';
import 'slot-text/style.css';

const motionOptions = {
  bounce: 0,
  duration: 190,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  interrupt: true,
  skipUnchanged: true,
  stagger: 18,
};

function SlotText({ text }) {
  const value = String(text);
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    return (
      <span className="slot-text slot-text--static" aria-label={value}>
        {value}
      </span>
    );
  }

  return (
    <AnimatedSlotText
      className="slot-text"
      text={value}
      options={motionOptions}
      aria-label={value}
    />
  );
}

SlotText.propTypes = {
  text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default SlotText;
