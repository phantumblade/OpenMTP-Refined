import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import M3Menu from '../../../components/m3/M3Menu';
import SlotText from '../../../components/SlotText';
import AnimatedWidth from '../../../components/m3/AnimatedWidth';
import { styles } from '../styles/FileExplorerTableFooterRender';
import { DEVICE_TYPE } from '../../../enums';
import { DEVICES_LABEL } from '../../../constants';
import { getDeviceBrand, translate } from '../../../i18n';
import { sanitizePath } from '../../../utils/files';
import { quickHash } from '../../../utils/funcs';
import { isTransferPhaseActive } from '../../../helpers/fileTransfer';
import {
  FILE_KIND_FILTER,
  countFileKinds,
} from '../../../helpers/fileKindFilter';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';

// order in which the row makes room for the path (see the fit* styles)
const FIT_STEPS = ['fitLabels', 'fitMid', 'fitRoot', 'fitCompact'];

// One row at the bottom of each pane: where you are (device and path), the
// items ready to paste, and the counters, which filter the view to every
// item, only the folders or only the files.
class FileExplorerTableFooterRender extends PureComponent {
  constructor(props) {
    super(props);

    this.rootRef = React.createRef();
    this.crumbsRef = React.createRef();
    this.state = { hiddenMenu: null };
  }

  componentDidMount() {
    this.fit();

    if (window.ResizeObserver) {
      this.resizeObserver = new window.ResizeObserver(() => this.fit());
      this.resizeObserver.observe(this.rootRef.current);
    }
  }

  componentDidUpdate(prevProps) {
    const { currentBrowsePath, deviceType } = this.props;

    this.lastPath = prevProps.currentBrowsePath[deviceType];
    this.fit();
    // the rolling digits settle after a moment: measure again then
    clearTimeout(this.fitTimer);
    this.fitTimer = setTimeout(this.fit, 600);

    if (
      prevProps.currentBrowsePath[deviceType] !== currentBrowsePath[deviceType]
    ) {
      this.enteredPath = currentBrowsePath[deviceType];
    }
  }

  componentWillUnmount() {
    clearTimeout(this.fitTimer);
    this.resizeObserver?.disconnect();
  }

  // apply the steps one by one until the path fits; never cut a name
  fit = () => {
    const { classes: styles } = this.props;
    const root = this.rootRef.current;
    const crumbs = this.crumbsRef.current;

    if (!root || !crumbs) {
      return;
    }

    FIT_STEPS.forEach((step) => root.classList.remove(styles[step]));

    const tight = () => crumbs.scrollWidth > crumbs.clientWidth + 1;

    FIT_STEPS.some((step) => {
      if (!tight()) {
        return true;
      }

      root.classList.add(styles[step]);

      return false;
    });

    // once the path is shorter, the counter labels may fit again
    if (root.classList.contains(styles.fitMid)) {
      root.classList.remove(styles.fitLabels);

      if (tight()) {
        root.classList.add(styles.fitLabels);
      }
    }
  };

  tokenizePath = () => {
    const { currentBrowsePath, deviceType, appLanguage } = this.props;
    const path = sanitizePath(currentBrowsePath[deviceType] || '/');
    const parts = path === '/' ? [''] : path.split('/');

    return parts.map((part, index) => ({
      label: index === 0 ? translate(appLanguage, 'Root') : part,
      path: index === 0 ? '/' : parts.slice(0, index + 1).join('/'),
      isRoot: index === 0,
      isLast: index === parts.length - 1,
    }));
  };

  openPath = (path) => {
    const { onBreadcrumbPathClick, deviceType } = this.props;

    onBreadcrumbPathClick({ path });
    analyticsService.sendEvent(
      EVENT_TYPE[`${deviceType.toUpperCase()}_BREADCRUMB_PATH_TAP`],
      {}
    );
  };

  // "…": a menu with the folders the row had to hide
  openHiddenMenu = (event, tokens) => {
    const { classes: styles } = this.props;
    const rootHidden = this.rootRef.current?.classList.contains(styles.fitRoot);
    const hidden = tokens.filter(
      (token) => !token.isLast && (rootHidden || !token.isRoot)
    );
    const rect = event.currentTarget.getBoundingClientRect();

    this.setState({
      hiddenMenu: {
        anchorPosition: { top: rect.top - 8, left: rect.left },
        items: hidden,
      },
    });
  };

  deviceName = () => {
    const { deviceType, mtpDevice, appLanguage } = this.props;
    const info = mtpDevice?.isAvailable && mtpDevice?.info?.mtpDeviceInfo;

    if (deviceType === DEVICE_TYPE.mtp && info) {
      return `${getDeviceBrand(info.Manufacturer)} ${info.Model}`.trim();
    }

    return translate(appLanguage, DEVICES_LABEL[deviceType]);
  };

  renderPath() {
    const { classes: styles, deviceType, currentBrowsePath } = this.props;
    const tokens = this.tokenizePath();
    const current = currentBrowsePath[deviceType];
    const grew =
      this.lastPath !== undefined &&
      this.enteredPath === current &&
      String(current).length > String(this.lastPath).length;

    return (
      <div className={styles.pathField}>
        <Tooltip title={this.deviceName()}>
          <span className={styles.deviceIcon}>
            <MaterialSymbol
              name={deviceType === DEVICE_TYPE.mtp ? 'mobile' : 'laptop_mac'}
              size={18}
              fill={1}
            />
          </span>
        </Tooltip>
        <ol className={styles.crumbs} ref={this.crumbsRef}>
          {tokens.map((token, index) => {
            const isMid = !token.isRoot && !token.isLast;
            const separator = !token.isLast && (
              <MaterialSymbol
                name="chevron_right"
                size={16}
                className={styles.separator}
              />
            );

            return (
              <React.Fragment key={quickHash(token.path)}>
                <li
                  className={classNames(styles.crumbItem, {
                    [styles.crumbRoot]: token.isRoot && !token.isLast,
                    [styles.crumbMid]: isMid,
                  })}
                >
                  <Tooltip title={token.path}>
                    <button
                      type="button"
                      aria-current={token.isLast ? 'location' : undefined}
                      className={classNames(styles.crumb, {
                        [styles.crumbCurrent]: token.isLast,
                        [styles.crumbEnter]: token.isLast && grew,
                      })}
                      onClick={() => !token.isLast && this.openPath(token.path)}
                    >
                      {token.label}
                    </button>
                  </Tooltip>
                  {separator}
                </li>
                {/* "…" stands in for the hidden middle folders */}
                {index === 0 && tokens.length > 2 && (
                  <li
                    className={classNames(styles.crumbItem, styles.crumbMore)}
                  >
                    <button
                      type="button"
                      className={styles.crumb}
                      aria-haspopup="menu"
                      onClick={(event) => this.openHiddenMenu(event, tokens)}
                    >
                      …
                    </button>
                    <MaterialSymbol
                      name="chevron_right"
                      size={16}
                      className={styles.separator}
                    />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    );
  }

  renderClipboard() {
    const {
      classes: styles,
      deviceType,
      fileTransferClipboard,
      fileTransferProgress,
      appLanguage,
      onPaste,
    } = this.props;
    const count = fileTransferClipboard.queue.length;
    const t = (key) => translate(appLanguage, key);

    if (count < 1) {
      return null;
    }

    const isDestination =
      fileTransferClipboard.source &&
      fileTransferClipboard.source !== deviceType;

    if (!isDestination) {
      return (
        <span className={styles.clip}>
          <MaterialSymbol name="content_paste" size={18} />
          <AnimatedWidth>
            <SlotText text={String(count)} />
            <span className={styles.clipLabel}>
              &nbsp;{t(count === 1 ? 'item ready' : 'items ready')}
            </span>
          </AnimatedWidth>
        </span>
      );
    }

    const transferActive = isTransferPhaseActive(fileTransferProgress?.phase);

    return (
      <button
        type="button"
        className={classNames(styles.clip, styles.clipAction)}
        disabled={transferActive}
        onClick={(event) => {
          event.stopPropagation();
          onPaste();
        }}
      >
        <MaterialSymbol name="swap_horiz" size={18} />
        <AnimatedWidth>
          <span className={styles.clipLabel}>
            {t(transferActive ? 'Transfer in progress' : 'Transfer here')}
            &nbsp;
          </span>
          <SlotText text={String(count)} />
        </AnimatedWidth>
      </button>
    );
  }

  renderFilters() {
    const {
      classes: styles,
      countedNodes,
      kindFilter,
      onKindFilterChange,
      appLanguage,
    } = this.props;
    const t = (key) => translate(appLanguage, key);
    const counts = countFileKinds(countedNodes);
    const buttons = [
      {
        kind: FILE_KIND_FILTER.all,
        icon: 'apps',
        label: t('all'),
        tooltip: t('Show folders and files'),
      },
      {
        kind: FILE_KIND_FILTER.dirs,
        icon: 'folder',
        label: t(counts.dirs === 1 ? 'folder' : 'folders'),
        tooltip: t('Show only folders'),
      },
      {
        kind: FILE_KIND_FILTER.files,
        icon: 'draft',
        label: t(counts.files === 1 ? 'file' : 'files'),
        tooltip: t('Show only files'),
      },
    ];

    return (
      <div className={styles.filters} role="group" aria-label={t('Show')}>
        {buttons.map(({ kind, icon, label, tooltip }) => {
          const active = kindFilter === kind;

          return (
            <Tooltip key={kind} title={tooltip}>
              <button
                type="button"
                aria-pressed={active}
                className={classNames(styles.filter, {
                  [styles.filterActive]: active,
                })}
                onClick={(event) => {
                  event.stopPropagation();
                  onKindFilterChange(kind);
                }}
              >
                <MaterialSymbol
                  name={icon}
                  size={20}
                  fill={active ? 1 : 0}
                  className={classNames(styles.filterIcon, {
                    [styles.filterAllIcon]: kind === FILE_KIND_FILTER.all,
                  })}
                />
                <AnimatedWidth>
                  <span className={styles.filterCount}>
                    <SlotText text={String(counts[kind])} />
                  </span>
                  <span className={styles.filterLabel}>
                    <SlotText text={label} />
                  </span>
                </AnimatedWidth>
              </button>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  render() {
    const { classes: styles, isStatusBarEnabled, appLanguage } = this.props;
    const { hiddenMenu } = this.state;

    return (
      <div className={styles.root} ref={this.rootRef}>
        {this.renderPath()}
        {this.renderClipboard()}
        {isStatusBarEnabled && this.renderFilters()}
        <M3Menu
          open={Boolean(hiddenMenu)}
          anchorPosition={hiddenMenu?.anchorPosition}
          ariaLabel={translate(appLanguage, 'Hidden folders')}
          onClose={() => this.setState({ hiddenMenu: null })}
          groups={[
            (hiddenMenu?.items || []).map((token) => ({
              id: token.path,
              icon: token.isRoot ? 'hard_drive' : 'folder',
              label: token.label,
              onClick: () => this.openPath(token.path),
            })),
          ]}
        />
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableFooterRender);
