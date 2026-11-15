import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../m3/MaterialSymbol';
import { styles, STACK_SIZE } from './styles';
import {
  setDragStackWaiting,
  subscribeDragStack,
} from '../../helpers/dragStack';
import { formatStorageSize } from '../../helpers/diskSpace';
import { translate } from '../../i18n';
import { DEVICE_TYPE } from '../../enums';
import { makeFilesDrag } from '../../containers/HomePage/selectors';
import { makeAppLanguage } from '../../containers/Settings/selectors';

const EMPHASIZED = 'cubic-bezier(0.2, 0, 0, 1)';
const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';
// how long a dropped stack waits for the transfer dialog to take it over
const HAND_OFF_WAIT_MS = 900;

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The dragged selection, drawn by the app instead of the browser's static
// drag image, so it can follow the pointer with a little lag, lean into the
// motion, say what a drop will do and, once dropped, fly into the transfer
// dialog (see helpers/dragStack).
class DragStack extends PureComponent {
  constructor(props) {
    super(props);

    this.rootRef = React.createRef();
    this.state = { active: false, icons: [], count: 0, bytes: 0 };
    this.position = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.tilt = 0;
    this.frame = null;
    this.dropped = false;
  }

  componentDidMount() {
    this.unsubscribe = subscribeDragStack(this.onStackEvent);
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.stopFollowing();
    clearTimeout(this.leaveTimer);
  }

  onStackEvent = (type, payload) => {
    switch (type) {
      case 'begin':
        this.begin(payload);
        break;
      case 'drop':
        this.drop();
        break;
      case 'end':
        if (!this.dropped) {
          this.flyBack();
        }

        break;
      case 'handoff':
        this.flyInto(payload);
        break;
      default:
        break;
    }
  };

  onDragOver = (event) => {
    this.target = { x: event.clientX, y: event.clientY };
  };

  begin = ({ icons = [], count = 0, bytes = 0, from = null, x, y }) => {
    clearTimeout(this.leaveTimer);
    setDragStackWaiting(false);
    this.dropped = false;
    this.from = from;
    this.position = { x, y };
    this.target = { x, y };
    this.tilt = 0;
    document.addEventListener('dragover', this.onDragOver, true);

    this.setState(
      { active: true, folded: false, icons: icons.slice(0, 3), count, bytes },
      () => {
        this.place();
        this.rootRef.current?.animate(
          [
            { opacity: 0, scale: '0.6' },
            { opacity: 1, scale: '1' },
          ],
          { duration: prefersReducedMotion() ? 0 : 320, easing: SPRING }
        );
        this.follow();
      }
    );
  };

  // the stack trails the pointer and leans into its motion
  follow = () => {
    const reduce = prefersReducedMotion();
    const step = () => {
      const lag = reduce ? 1 : 0.32;

      this.position.x += (this.target.x - this.position.x) * lag;
      this.position.y += (this.target.y - this.position.y) * lag;

      const lean = reduce
        ? 0
        : Math.max(-12, Math.min(12, (this.target.x - this.position.x) * 0.35));

      this.tilt += (lean - this.tilt) * 0.2;
      this.place();
      this.frame = window.requestAnimationFrame(step);
    };

    this.cancelFrame();
    this.frame = window.requestAnimationFrame(step);
  };

  cancelFrame = () => {
    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  };

  stopFollowing = () => {
    this.cancelFrame();
    document.removeEventListener('dragover', this.onDragOver, true);
  };

  place = () => {
    const root = this.rootRef.current;

    if (root) {
      root.style.transform = `translate(${this.position.x}px, ${this.position.y}px) rotate(${this.tilt}deg)`;
    }
  };

  // dropped on the other pane: fold into one round shape and wait for the
  // transfer dialog to take it over
  drop = () => {
    this.dropped = true;
    this.stopFollowing();
    this.tilt = 0;
    this.place();
    this.setState({ folded: true });
    setDragStackWaiting(true);
    this.leaveTimer = setTimeout(() => {
      setDragStackWaiting(false);
      this.vanish();
    }, HAND_OFF_WAIT_MS);
  };

  animateTo = async (keyframes, options) => {
    const root = this.rootRef.current;

    if (!root) {
      return;
    }

    try {
      await root.animate(keyframes, { fill: 'forwards', ...options }).finished;
    } catch (e) {
      // cancelled
    }
  };

  // into the transfer dialog's status indicator
  flyInto = async (rect) => {
    clearTimeout(this.leaveTimer);

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const scale = Math.max(0.2, rect.width / STACK_SIZE);

    await this.animateTo(
      [
        { transform: this.rootRef.current?.style.transform, opacity: 1 },
        {
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          opacity: 1,
          offset: 0.85,
        },
        { transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity: 0 },
      ],
      {
        duration: prefersReducedMotion() ? 0 : 420,
        easing: EMPHASIZED_DECELERATE,
      }
    );
    this.hide();
  };

  // not dropped anywhere useful: back to the selection
  flyBack = async () => {
    this.stopFollowing();

    const { from } = this;
    const x = from ? from.left + from.width / 2 : this.position.x;
    const y = from ? from.top + from.height / 2 : this.position.y;

    await this.animateTo(
      [
        { transform: this.rootRef.current?.style.transform, opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(0.5)`, opacity: 0 },
      ],
      { duration: prefersReducedMotion() ? 0 : 360, easing: EMPHASIZED }
    );
    this.hide();
  };

  vanish = async () => {
    await this.animateTo(
      [
        { transform: this.rootRef.current?.style.transform, opacity: 1 },
        {
          transform: `${this.rootRef.current?.style.transform} scale(0.6)`,
          opacity: 0,
        },
      ],
      { duration: prefersReducedMotion() ? 0 : 200, easing: EMPHASIZED }
    );
    this.hide();
  };

  hide = () => {
    this.rootRef.current?.getAnimations().forEach((a) => a.cancel());
    this.setState({ active: false, folded: false });
  };

  labelFor = (state) => {
    const { appLanguage, filesDrag } = this.props;
    const { count, bytes } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const items = `${count} ${t(count === 1 ? 'item' : 'items')}`;

    if (state === 'over') {
      return {
        icon: 'arrow_forward',
        text: t(
          filesDrag?.destinationDeviceType === DEVICE_TYPE.mtp
            ? 'Copy {items} to the phone'
            : 'Copy {items} to the Mac',
          { items }
        ),
      };
    }

    if (state === 'blocked') {
      return { icon: 'block', text: t('Already here') };
    }

    return {
      icon: 'content_copy',
      text:
        bytes > 0
          ? `${items} · ${formatStorageSize(bytes, appLanguage)}`
          : items,
    };
  };

  render() {
    const { classes: styles, filesDrag } = this.props;
    const { active, folded, icons, count } = this.state;

    if (!active) {
      return null;
    }

    const { sourceDeviceType, destinationDeviceType, enter } = filesDrag || {};
    let state = 'idle';

    if (destinationDeviceType && destinationDeviceType === sourceDeviceType) {
      state = 'blocked';
    } else if (destinationDeviceType && enter) {
      state = 'over';
    }

    const label = this.labelFor(state);
    // the first item on top, the next ones fanned behind it
    const cards = [icons[2], icons[1], icons[0]];

    return (
      <div
        ref={this.rootRef}
        className={classNames(styles.root, {
          [styles.over]: state === 'over' && !folded,
          [styles.blocked]: state === 'blocked' && !folded,
          [styles.folded]: folded,
        })}
        aria-hidden="true"
      >
        <div className={styles.stack}>
          {cards.map((src, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={classNames(styles.card, {
                [styles.cardEmpty]: !src && index < 2,
              })}
            >
              {src ? (
                <img src={src} alt="" />
              ) : (
                index === 2 && <MaterialSymbol name="draft" size={40} />
              )}
            </div>
          ))}
          <span className={styles.count}>{count}</span>
        </div>
        <span className={styles.label}>
          <MaterialSymbol name={label.icon} size={18} fill={1} />
          {label.text}
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filesDrag: makeFilesDrag(state),
  appLanguage: makeAppLanguage(state),
});

export default connect(mapStateToProps)(withStyles(styles)(DragStack));
