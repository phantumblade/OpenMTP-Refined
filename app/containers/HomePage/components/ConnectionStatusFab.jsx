import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import AngryFaceAnimation from '../../../components/m3/AngryFaceAnimation';
import { styles } from '../styles/ConnectionStatusFab';

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

// The connection problem as a Material 3 extended FAB floating at the bottom
// of the phone pane: it pops in when a problem appears, and opens into a card
// with the explanation, the steps and the actions.
class ConnectionStatusFab extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { expanded: Boolean(firstStatus(props.children)?.actions) };
  }

  componentDidUpdate(prevProps) {
    const { children } = this.props;
    const status = firstStatus(children);

    // a new problem starts collapsed, unless it needs the user to act
    if (firstStatus(prevProps.children)?.key !== status?.key) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ expanded: Boolean(status?.actions) });
    }
  }

  toggle = () => {
    this.setState(({ expanded }) => ({ expanded: !expanded }));
  };

  render() {
    const { classes: styles, children, closeLabel, detailsLabel } = this.props;
    const { expanded } = this.state;
    const status = firstStatus(children);

    if (!status) {
      return null;
    }

    return (
      <div className={styles.dock}>
        <div className={styles.anchor} key={status.key}>
          {expanded ? (
            <section
              className={styles.card}
              role="alert"
              aria-labelledby={`status-${status.key}`}
            >
              <div className={styles.cardHeader}>
                <AngryFaceAnimation size={44} className={styles.face} />
                <h3 id={`status-${status.key}`} className={styles.cardTitle}>
                  {status.title}
                </h3>
                <button
                  type="button"
                  className={styles.close}
                  aria-label={closeLabel}
                  onClick={this.toggle}
                >
                  <MaterialSymbol name="close" size={22} />
                </button>
              </div>
              {status.body && (
                <div className={styles.cardBody}>{status.body}</div>
              )}
              {status.actions && (
                <div className={styles.cardActions}>{status.actions}</div>
              )}
            </section>
          ) : (
            <button
              type="button"
              className={classNames(styles.fab)}
              aria-expanded={false}
              aria-label={`${status.title}. ${detailsLabel}`}
              onClick={this.toggle}
            >
              <AngryFaceAnimation size={28} className={styles.face} />
              <span className={styles.fabLabel}>{status.title}</span>
              <MaterialSymbol
                name="expand_less"
                size={22}
                className={styles.fabChevron}
              />
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ConnectionStatusFab);
