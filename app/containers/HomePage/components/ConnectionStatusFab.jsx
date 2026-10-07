import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import AngryFaceAnimation from '../../../components/m3/AngryFaceAnimation';
import { styles, STATUS_EXIT_MS } from '../styles/ConnectionStatusFab';

// Declares one problem; the FAB shows the first one among its children.
export function ConnectionStatusItem() {
  return null;
}

const firstStatus = (children) => {
  const item = React.Children.toArray(children).find(
    (child) => child && child.type === ConnectionStatusItem
  );

  return item
    ? {
        key: item.props.statusKey,
        title: item.props.title,
        body: item.props.body,
        actions: item.props.actions,
      }
    : null;
};

// Space the floating card keeps free under the pane's content.
const SPACE_PROPERTY = '--status-fab-space';
const SPACE_GAP = 40;

// The connection problem as a large Material 3 extended FAB floating at the
// bottom of the phone pane. It always shows the whole message (title,
// explanation, actions), grows in when a problem appears and shrinks away
// when it is solved or closed.
class ConnectionStatusFab extends PureComponent {
  constructor(props) {
    super(props);

    this.dockRef = React.createRef();
    this.cardRef = React.createRef();
    this.state = { dismissedKey: null, leaving: null };
  }

  componentDidMount() {
    this.observeCard();
  }

  componentDidUpdate(prevProps) {
    const { children } = this.props;
    const { dismissedKey } = this.state;
    const previous = firstStatus(prevProps.children);
    const status = firstStatus(children);

    // the problem went away: let the card leave instead of vanishing
    if (previous && !status && previous.key !== dismissedKey) {
      this.leave(previous);
    }

    // a closed problem shows again if it comes back later
    if (!status && dismissedKey) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ dismissedKey: null });
    }

    this.observeCard();
  }

  componentWillUnmount() {
    clearTimeout(this.leaveTimer);
    this.resizeObserver?.disconnect();
    this.setSpace(0);
  }

  setSpace = (height) => {
    const cell = this.dockRef.current?.parentElement;

    cell?.style.setProperty(
      SPACE_PROPERTY,
      `${height > 0 ? Math.ceil(height) + SPACE_GAP : 0}px`
    );
  };

  observeCard = () => {
    const card = this.cardRef.current;

    if (card === this.observedCard) {
      return;
    }

    this.resizeObserver?.disconnect();
    this.observedCard = card;

    if (!card) {
      this.setSpace(0);

      return;
    }

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        this.setSpace(entry.target.offsetHeight);
      });
    }

    this.resizeObserver.observe(card);
  };

  leave = (status) => {
    clearTimeout(this.leaveTimer);
    this.setState({ leaving: status });
    this.leaveTimer = setTimeout(() => {
      this.setState({ leaving: null });
    }, STATUS_EXIT_MS);
  };

  dismiss = (status) => {
    this.setState({ dismissedKey: status.key });
    this.leave(status);
  };

  render() {
    const { classes: styles, children, closeLabel } = this.props;
    const { dismissedKey, leaving } = this.state;
    const current = firstStatus(children);
    const visible = current && current.key !== dismissedKey ? current : null;
    const status = visible || leaving;

    return (
      <div className={styles.dock} ref={this.dockRef}>
        {status && (
          <div className={styles.anchor}>
            <section
              key={status.key}
              ref={visible ? this.cardRef : undefined}
              className={visible ? styles.card : styles.cardLeaving}
              role="alert"
              aria-labelledby={`status-${status.key}`}
            >
              <AngryFaceAnimation size={48} className={styles.face} />
              <div className={styles.content}>
                <h3 id={`status-${status.key}`} className={styles.title}>
                  {status.title}
                </h3>
                {status.body && (
                  <div className={styles.body}>{status.body}</div>
                )}
                {status.actions && (
                  <div className={styles.actions}>{status.actions}</div>
                )}
              </div>
              <button
                type="button"
                className={styles.close}
                aria-label={closeLabel}
                disabled={!visible}
                onClick={() => this.dismiss(status)}
              >
                <MaterialSymbol name="close" size={22} />
              </button>
            </section>
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ConnectionStatusFab);
