import React from 'react';
import PropTypes from 'prop-types';

function SlotText({ text }) {
  const value = String(text);

  return (
    <span className="slot-text" aria-label={value}>
      {value}
    </span>
  );
}

SlotText.propTypes = {
  text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default SlotText;
