import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import MovieOutlinedIcon from '@material-ui/icons/MovieOutlined';
import AudiotrackOutlinedIcon from '@material-ui/icons/AudiotrackOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import FileExplorerTableGridRender from './FileExplorerTableBodyGridRender';
import { styles } from '../styles/FileExplorerTableBodyGridWrapperRender';
import { calculateGridWindow } from '../../../utils/virtualWindow';
import { getFileCategory } from '../../../helpers/fileExplorerIcons';

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
    this.state = {
      source: props.tableSort,
      startIndex: 0,
      endIndex: Math.min(props.tableSort.length, 50),
      beforeSize: 0,
      afterSize: 0,
      collapsedSections: {},
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
  }

  componentDidUpdate(prevProps) {
    const { tableSort, selectedPaths } = this.props;

    if (prevProps.tableSort !== tableSort) {
      this.scheduleWindowUpdate();
    }

    if (
      prevProps.selectedPaths !== selectedPaths &&
      selectedPaths.length === 1
    ) {
      this.ensureSelectedItemIsVisible();
    }
  }

  componentWillUnmount() {
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
      itemCount: tableSort.length,
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

    this.setState((state) => {
      if (
        state.startIndex === nextWindow.startIndex &&
        state.endIndex === nextWindow.endIndex &&
        state.beforeSize === nextWindow.beforeSize &&
        state.afterSize === nextWindow.afterSize
      ) {
        return null;
      }

      return nextWindow;
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
            group.items.map((item) => (
              <FileExplorerTableGridRender
                key={item.path}
                item={item}
                isSelected={selectedSet.has(item.path)}
                deviceType={deviceType}
                _eventTarget={_eventTarget}
                getTableData={getTableData}
                onContextMenuClick={onContextMenuClick}
                onTableClick={onTableClick}
                onTableDoubleClick={onTableDoubleClick}
                multiSelectMode={multiSelectMode}
                appThemeMode={appThemeMode}
                currentBrowsePath={currentBrowsePath}
              />
            ))}
        </Fragment>
      );
    });
  };

  render() {
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
      orderBy,
    } = this.props;

    if (orderBy === 'extension') {
      return (
        <TableRow>
          <TableCell colSpan={6} className={styles.gridTableCell}>
            <div
              ref={this.setWrapper}
              className={styles.wrapper}
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

    const { startIndex, endIndex, beforeSize, afterSize } = this.state;
    const selectedSet = this.getSelectedPathsSet();
    const visibleItems = tableSort.slice(startIndex, endIndex);

    return (
      <TableRow>
        <TableCell colSpan={6} className={styles.gridTableCell}>
          <div
            ref={this.setWrapper}
            className={styles.wrapper}
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
            {visibleItems.map((item) => (
              <FileExplorerTableGridRender
                key={item.path}
                item={item}
                isSelected={selectedSet.has(item.path)}
                deviceType={deviceType}
                _eventTarget={_eventTarget}
                getTableData={getTableData}
                onContextMenuClick={onContextMenuClick}
                onTableClick={onTableClick}
                onTableDoubleClick={onTableDoubleClick}
                multiSelectMode={multiSelectMode}
                appThemeMode={appThemeMode}
                currentBrowsePath={currentBrowsePath}
              />
            ))}
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
