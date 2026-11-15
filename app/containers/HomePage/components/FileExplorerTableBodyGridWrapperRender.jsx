import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import classNames from 'classnames';
import {
  ArchiveOutlined as ArchiveOutlinedIcon,
  AudiotrackOutlined as AudiotrackOutlinedIcon,
  CodeOutlined as CodeOutlinedIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  FolderOutlined as FolderOutlinedIcon,
  ImageOutlined as ImageOutlinedIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  MovieOutlined as MovieOutlinedIcon,
} from '../../../components/m3/symbolIcons';
import FileExplorerTableGridRender from './FileExplorerTableBodyGridRender';
import {
  styles,
  GRID_ENTER_MS,
} from '../styles/FileExplorerTableBodyGridWrapperRender';
import { calculateGridWindow } from '../../../utils/virtualWindow';
import { getFileCategory } from '../../../helpers/fileExplorerIcons';
import { isFolderLocked } from '../../../helpers/folderAccess';
import { DEVICE_TYPE } from '../../../enums';
import { joinedCorners } from '../../../helpers/selectionShape';
import {
  getIncomingTransfer,
  subscribeIncomingTransfer,
} from '../../../helpers/incomingTransfer';
import FileExplorerTableBodyIncomingTile from './FileExplorerTableBodyIncomingTile';

const ITEM_WIDTH = 118;
const ITEM_HEIGHT = 155;
const OVERSCAN_ROWS = 3;

const renderCategoryIcon = (typeKey, className) => {
  switch (typeKey) {
    case 'folders':
      return <FolderOutlinedIcon className={className} />;
    case 'images':
      return <ImageOutlinedIcon className={className} />;
    case 'videos':
      return <MovieOutlinedIcon className={className} />;
    case 'audio':
      return <AudiotrackOutlinedIcon className={className} />;
    case 'documents':
      return <DescriptionOutlinedIcon className={className} />;
    case 'archives':
      return <ArchiveOutlinedIcon className={className} />;
    case 'code':
      return <CodeOutlinedIcon className={className} />;
    default:
      return <InsertDriveFileOutlinedIcon className={className} />;
  }
};

class FileExplorerTableBodyGridWrapperRender extends PureComponent {
  constructor(props) {
    super(props);

    this.animationFrame = null;
    this.resizeObserver = null;
    this.scrollContainer = null;
    this.wrapper = null;
    this.itemIndexSource = null;
    this.itemIndexByPath = new Map();
    this.selectedPathsSource = null;
    this.selectedPathsSet = new Set();
    this.enteredPath = this.browsePath();
    this.enterTimer = null;
    this.state = {
      // true while the tiles of a freshly opened folder animate in
      entering: true,
      source: props.tableSort,
      startIndex: 0,
      endIndex: Math.min(props.tableSort.length, 50),
      beforeSize: 0,
      afterSize: 0,
      // tiles per row, so a selected tile knows its selected neighbours
      columns: 1,
      collapsedSections: {},
      // what a running copy is bringing into a folder (helpers/incomingTransfer)
      incoming: getIncomingTransfer(),
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.tableSort !== state.source) {
      return {
        source: props.tableSort,
        startIndex: 0,
        endIndex: Math.min(props.tableSort.length, 50),
        beforeSize: 0,
        afterSize: 0,
      };
    }

    return null;
  }

  componentDidMount() {
    const { scrollContainerId } = this.props;

    this.scrollContainer = document.getElementById(scrollContainerId);

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener(
        'scroll',
        this.scheduleWindowUpdate,
        {
          passive: true,
        }
      );
    }

    if (window.ResizeObserver && this.wrapper) {
      this.resizeObserver = new window.ResizeObserver(
        this.scheduleWindowUpdate
      );
      this.resizeObserver.observe(this.wrapper);
    } else {
      window.addEventListener('resize', this.scheduleWindowUpdate);
    }

    this.scheduleWindowUpdate();
    this.endEnteringLater();
    this.unsubscribeIncoming = subscribeIncomingTransfer((incoming) => {
      this.setState({ incoming }, this.scheduleWindowUpdate);
    });
  }

  componentDidUpdate(prevProps) {
    const { tableSort, selectedPaths, currentBrowsePath } = this.props;

    if (prevProps.tableSort !== tableSort) {
      this.scheduleWindowUpdate();
    }

    // another folder: play the entrance once. The list and the path arrive
    // in two updates of the same task (list first when going back up, path
    // first when opening a folder), before the browser paints, so checking
    // on either change never shows the tiles before they rise in.
    if (
      (prevProps.tableSort !== tableSort ||
        prevProps.currentBrowsePath !== currentBrowsePath) &&
      this.browsePath() !== this.enteredPath
    ) {
      this.enteredPath = this.browsePath();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ entering: true });
      this.endEnteringLater();
    }

    if (
      prevProps.selectedPaths !== selectedPaths &&
      selectedPaths.length === 1
    ) {
      this.ensureSelectedItemIsVisible();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.enterTimer);
    this.unsubscribeIncoming?.();

    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener(
        'scroll',
        this.scheduleWindowUpdate
      );
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', this.scheduleWindowUpdate);
    }
  }

  toggleSection = (groupId) => {
    this.setState((prevState) => ({
      collapsedSections: {
        ...prevState.collapsedSections,
        [groupId]: !prevState.collapsedSections[groupId],
      },
    }));
  };

  getSelectedPathsSet = () => {
    const { selectedPaths } = this.props;

    if (this.selectedPathsSource !== selectedPaths) {
      this.selectedPathsSource = selectedPaths;
      this.selectedPathsSet = new Set(selectedPaths);
    }

    return this.selectedPathsSet;
  };

  getItemIndex = (path) => {
    const { tableSort } = this.props;

    if (this.itemIndexSource !== tableSort) {
      this.itemIndexSource = tableSort;
      this.itemIndexByPath = new Map(
        tableSort.map((item, index) => [item.path, index])
      );
    }

    return this.itemIndexByPath.get(path) ?? -1;
  };

  getWrapperOffset = () => {
    if (!this.wrapper || !this.scrollContainer) {
      return 0;
    }

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const containerRect = this.scrollContainer.getBoundingClientRect();

    return wrapperRect.top - containerRect.top + this.scrollContainer.scrollTop;
  };

  scheduleWindowUpdate = () => {
    if (this.animationFrame) {
      return;
    }

    this.animationFrame = window.requestAnimationFrame(() => {
      this.animationFrame = null;
      this.updateWindow();
    });
  };

  updateWindow = () => {
    const { tableSort } = this.props;

    if (!this.wrapper || !this.scrollContainer) {
      return;
    }

    const nextWindow = calculateGridWindow({
      itemCount: tableSort.length + this.incomingItems().length,
      scrollOffset: Math.max(
        0,
        this.scrollContainer.scrollTop - this.getWrapperOffset()
      ),
      viewportSize: this.scrollContainer.clientHeight,
      containerSize: this.wrapper.clientWidth,
      itemWidth: ITEM_WIDTH,
      itemHeight: ITEM_HEIGHT,
      overscanRows: OVERSCAN_ROWS,
    });

    const columns = Math.max(
      1,
      Math.floor(this.wrapper.clientWidth / ITEM_WIDTH)
    );

    this.setState((state) => {
      if (
        state.startIndex === nextWindow.startIndex &&
        state.endIndex === nextWindow.endIndex &&
        state.beforeSize === nextWindow.beforeSize &&
        state.afterSize === nextWindow.afterSize &&
        state.columns === columns
      ) {
        return null;
      }

      return { ...nextWindow, columns };
    });
  };

  ensureSelectedItemIsVisible = () => {
    const { selectedPaths } = this.props;
    const { startIndex, endIndex } = this.state;
    const selectedIndex = this.getItemIndex(selectedPaths[0]);

    if (
      selectedIndex < 0 ||
      (selectedIndex >= startIndex && selectedIndex < endIndex) ||
      !this.wrapper ||
      !this.scrollContainer
    ) {
      return;
    }

    const columns = Math.max(
      1,
      Math.floor(this.wrapper.clientWidth / ITEM_WIDTH)
    );
    const selectedRow = Math.floor(selectedIndex / columns);

    this.scrollContainer.scrollTop =
      this.getWrapperOffset() + selectedRow * ITEM_HEIGHT;
    this.scheduleWindowUpdate();
  };

  setWrapper = (element) => {
    this.wrapper = element;
  };

  // the items a copy is bringing into the folder this pane shows (not the
  // ones already listed), shown first
  incomingItems = () => {
    const { deviceType, tableSort } = this.props;
    const { incoming } = this.state;

    if (
      !incoming ||
      incoming.destinationDeviceType !== deviceType ||
      incoming.destinationFolder !== this.browsePath()
    ) {
      return [];
    }

    const listed = new Set(tableSort.map((item) => item.name));

    return incoming.items.filter((item) => !listed.has(item.name));
  };

  // the incoming items, then the folder's own
  displayItems = () => {
    const { tableSort } = this.props;
    const incomingItems = this.incomingItems();

    return incomingItems.length > 0
      ? [
          ...incomingItems.map((item) => ({ ...item, incoming: true })),
          ...tableSort,
        ]
      : tableSort;
  };

  // which corners of the tile at [index] of [items] face another selected
  // tile (connected selection)
  joinedCornersAt = (items, index, selectedSet) => {
    const { columns } = this.state;

    return joinedCorners({
      index,
      columns,
      count: items.length,
      isSelectedAt: (i) => selectedSet.has(items[i].path),
    });
  };

  renderGroupedSections = () => {
    const {
      classes: styles,
      tableSort,
      deviceType,
      _eventTarget,
      getTableData,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
      multiSelectMode,
      appThemeMode,
      currentBrowsePath,
      favoritePaths,
    } = this.props;
    const { collapsedSections } = this.state;
    const selectedSet = this.getSelectedPathsSet();

    const groupsMap = new Map();

    tableSort.forEach((item) => {
      const cat = getFileCategory(item);

      if (!groupsMap.has(cat.id)) {
        groupsMap.set(cat.id, { ...cat, items: [] });
      }

      groupsMap.get(cat.id).items.push(item);
    });

    const groups = Array.from(groupsMap.values()).sort(
      (a, b) => a.order - b.order
    );

    return groups.map((group) => {
      const isCollapsed = Boolean(collapsedSections[group.id]);
      const count = group.items.length;

      return (
        <Fragment key={group.id}>
          <div
            className={styles.sectionHeader}
            onClick={() => this.toggleSection(group.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.sectionTitleBlock}>
              <span className={styles.sectionArrow}>
                {isCollapsed ? (
                  <KeyboardArrowRightIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )}
              </span>
              {renderCategoryIcon(group.id, styles.sectionIcon)}
              <span className={styles.sectionTitle}>{group.label}</span>
              <span className={styles.sectionBadge}>{count} file</span>
            </div>
            <div className={styles.sectionDividerLine} />
          </div>

          {!isCollapsed &&
            group.items.map((item, index) => (
              <FileExplorerTableGridRender
                key={item.path}
                item={item}
                isSelected={selectedSet.has(item.path)}
                joinedCorners={this.joinedCornersAt(
                  group.items,
                  index,
                  selectedSet
                )}
                isFavorite={!!favoritePaths && favoritePaths.has(item.path)}
                deviceType={deviceType}
                _eventTarget={_eventTarget}
                getTableData={getTableData}
                onContextMenuClick={onContextMenuClick}
                onTableClick={onTableClick}
                onTableDoubleClick={onTableDoubleClick}
                multiSelectMode={multiSelectMode}
                appThemeMode={appThemeMode}
                isLocked={this.isLocked(item)}
                currentBrowsePath={currentBrowsePath}
              />
            ))}
        </Fragment>
      );
    });
  };

  browsePath = () => {
    const { currentBrowsePath, deviceType } = this.props;

    return typeof currentBrowsePath === 'string'
      ? currentBrowsePath
      : currentBrowsePath?.[deviceType];
  };

  endEnteringLater = () => {
    clearTimeout(this.enterTimer);
    this.enterTimer = setTimeout(() => {
      this.setState({ entering: false });
    }, GRID_ENTER_MS);
  };

  // folders closed to OpenMTP (by the user or macOS) get a lock badge
  isLocked = (item) => {
    const { deviceType, folderAccess } = this.props;

    return (
      deviceType === DEVICE_TYPE.local &&
      Boolean(item.isFolder) &&
      isFolderLocked(item.path, folderAccess)
    );
  };

  render() {
    const {
      classes: styles,
      deviceType,
      _eventTarget,
      getTableData,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
      multiSelectMode,
      appThemeMode,
      currentBrowsePath,
      favoritePaths,
      orderBy,
    } = this.props;
    const { entering } = this.state;

    if (orderBy === 'extension') {
      return (
        <TableRow>
          <TableCell colSpan={6} className={styles.gridTableCell}>
            <div
              ref={this.setWrapper}
              className={classNames(styles.wrapper, {
                [styles.wrapperEntering]: entering,
              })}
              data-file-explorer-grid={deviceType}
              role="listbox"
              aria-multiselectable={multiSelectMode[deviceType]}
            >
              {this.renderGroupedSections()}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    const { startIndex, endIndex, beforeSize, afterSize, incoming } =
      this.state;
    const selectedSet = this.getSelectedPathsSet();
    const items = this.displayItems();
    const visibleItems = items.slice(startIndex, endIndex);

    return (
      <TableRow>
        <TableCell colSpan={6} className={styles.gridTableCell}>
          <div
            ref={this.setWrapper}
            className={classNames(styles.wrapper, {
              [styles.wrapperEntering]: entering,
            })}
            data-file-explorer-grid={deviceType}
            role="listbox"
            aria-multiselectable={multiSelectMode[deviceType]}
          >
            {beforeSize > 0 && (
              <div
                className={styles.virtualSpacer}
                style={{ height: beforeSize }}
                aria-hidden="true"
              />
            )}
            {visibleItems.map((item, offset) =>
              item.incoming ? (
                <FileExplorerTableBodyIncomingTile
                  key={`incoming:${item.path}`}
                  item={item}
                  index={incoming.items.findIndex(
                    (it) => it.path === item.path
                  )}
                  items={incoming.items}
                  deviceType={deviceType}
                  currentBrowsePath={currentBrowsePath}
                  appThemeMode={appThemeMode}
                />
              ) : (
                <FileExplorerTableGridRender
                  key={item.path}
                  item={item}
                  isSelected={selectedSet.has(item.path)}
                  joinedCorners={this.joinedCornersAt(
                    items,
                    startIndex + offset,
                    selectedSet
                  )}
                  isFavorite={!!favoritePaths && favoritePaths.has(item.path)}
                  deviceType={deviceType}
                  _eventTarget={_eventTarget}
                  getTableData={getTableData}
                  onContextMenuClick={onContextMenuClick}
                  onTableClick={onTableClick}
                  onTableDoubleClick={onTableDoubleClick}
                  multiSelectMode={multiSelectMode}
                  appThemeMode={appThemeMode}
                  isLocked={this.isLocked(item)}
                  currentBrowsePath={currentBrowsePath}
                />
              )
            )}
            {afterSize > 0 && (
              <div
                className={styles.virtualSpacer}
                style={{ height: afterSize }}
                aria-hidden="true"
              />
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridWrapperRender);
