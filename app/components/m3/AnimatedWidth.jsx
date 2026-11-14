import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

// Follows the width of its content smoothly: when a number gains or loses
// digits (or a label changes), the box around it, and the button it sits
// in, resize with M3's emphasized easing instead of jumping. The content
// is clipped only sideways while the box catches up, so rolling digits
// keep their vertical motion.

const EASING = '320ms cubic-bezier(0.2, 0, 0, 1)';

const styles = {
  outer: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    overflowX: 'clip',
    overflowY: 'visible',
    transition: `width ${EASING}`,
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  inner: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
};

class AnimatedWidth extends PureComponent {
  constructor(props) {
    super(props);

    this.outerRef = React.createRef();
    this.innerRef = React.createRef();
  }

  componentDidMount() {
    this.sync(true);

    if (window.ResizeObserver) {
      this.resizeObserver = new window.ResizeObserver(() => this.sync(false));
      this.resizeObserver.observe(this.innerRef.current);
    }
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  sync = (instant) => {
    const outer = this.outerRef.current;
    const inner = this.innerRef.current;

    if (!outer || !inner) {
      return;
    }

    const width = `${inner.offsetWidth}px`;

    if (instant) {
      outer.style.transition = 'none';
      outer.style.width = width;
      // apply now, then let later changes animate
      outer.getBoundingClientRect();
      outer.style.transition = '';

      return;
    }

    outer.style.width = width;
  };

  render() {
    const { classes, className, children } = this.props;

    return (
      <span
        ref={this.outerRef}
        className={classNames(classes.outer, className)}
      >
        <span ref={this.innerRef} className={classes.inner}>
          {children}
        </span>
      </span>
    );
  }
}

export default withStyles(styles)(AnimatedWidth);
