import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Tooltip from '@material-ui/core/Tooltip';
import { quickHash } from '../../utils/funcs';
import { styles } from './styles';
import { sanitizePath } from '../../utils/files';
import { analyticsService } from '../../services/analytics';
import { EVENT_TYPE } from '../../enums/events';

class Breadcrumb extends PureComponent {
  constructor(props) {
    super(props);

    this.breadcrumbRef = React.createRef();
  }

  componentDidMount() {
    this.scrollToEnd();
  }

  componentDidUpdate(prevProps) {
    const { currentBrowsePath } = this.props;

    if (prevProps.currentBrowsePath !== currentBrowsePath) {
      this.scrollToEnd();
    }
  }

  scrollToEnd = () => {
    if (this.breadcrumbRef.current) {
      this.breadcrumbRef.current.scrollLeft =
        this.breadcrumbRef.current.scrollWidth;
    }
  };

  _handleClickPath = (enabled, value, event) => {
    const { onBreadcrumbPathClick, deviceType } = this.props;

    event.preventDefault();

    if (!enabled) {
      return null;
    }

    onBreadcrumbPathClick({ path: value });

    const deviceTypeUpperCase = deviceType.toUpperCase();

    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceTypeUpperCase}_BREADCRUMB_PATH_TAP`],
      {}
    );
  };

  tokenizeCurrentBrowsePath(currentBrowsePath) {
    const sanitizedCurrentBrowsePath = sanitizePath(currentBrowsePath);
    const _currentBrowsePath = [];
    const currentBrowsePathBroken =
      sanitizedCurrentBrowsePath === '/'
        ? ['']
        : sanitizedCurrentBrowsePath.split('/');
    const currentBrowsePathBrokenLength = currentBrowsePathBroken.length;

    currentBrowsePathBroken.forEach((a, index) => {
      const isLast = index === currentBrowsePathBrokenLength - 1;

      if (a === '' && index === 0) {
        _currentBrowsePath.push({
          label: 'Root',
          path: '/',
          enabled: !isLast,
          bold: isLast,
        });

        return;
      }

      _currentBrowsePath.push({
        label: a,
        path: `${currentBrowsePathBroken.slice(0, index + 1).join('/')}`,
        enabled: !isLast,
        bold: isLast,
      });
    });

    return _currentBrowsePath;
  }

  BreadcrumbCellRender(tokenizeCurrentBrowsePath) {
    const { classes: styles } = this.props;

    return tokenizeCurrentBrowsePath.map((item, index) => {
      const { label, path, enabled, bold } = item;

      return (
        <Fragment key={quickHash(path)}>
          {index > 0 && (
            <KeyboardArrowRightIcon className={styles.breadcrumbSeperator} />
          )}
          <li className={styles.breadcrumbLi}>
            <Tooltip title={path}>
              <a
                className={classNames(styles.breadcrumbLiA, {
                  [styles.breadcrumbActiveA]: bold,
                })}
                onClick={(event) => {
                  this._handleClickPath(enabled, path, event);
                }}
              >
                {label}
              </a>
            </Tooltip>
          </li>
        </Fragment>
      );
    });
  }

  render() {
    const { classes: styles, currentBrowsePath } = this.props;

    return (
      <div className={styles.root}>
        <div className={styles.rootBreadcrumbs}>
          <Paper elevation={0}>
            <ul ref={this.breadcrumbRef} className={styles.breadcrumb}>
              {this.BreadcrumbCellRender(
                this.tokenizeCurrentBrowsePath(currentBrowsePath)
              )}
            </ul>
          </Paper>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Breadcrumb);
