import React, { PureComponent, Fragment } from 'react';
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
import FileExplorerTableRowsRender from './FileExplorerTableBodyListRender';
import { calculateListWindow } from '../../../utils/virtualWindow';
import { getFileCategory } from '../../../helpers/fileExplorerIcons';

const DEFAULT_ROW_HEIGHT = 40;
const OVERSCAN_ROWS = 8;

const renderCategoryIcon = (typeKey, style) => {
  const defaultStyle = {
    fontSize: 16,
    marginRight: 6,
    verticalAlign: 'middle',
    opacity: 0.85,
    ...style,
  };

  switch (typeKey) {
    case 'folders':
      return <FolderOutlinedIcon style={defaultStyle} />;
    case 'images':
      return <ImageOutlinedIcon style={defaultStyle} />;
    case 'videos':
      return <MovieOutlinedIcon style={defaultStyle} />;
    case 'audio':
      return <AudiotrackOutlinedIcon style={defaultStyle} />;
    case 'documents':
      return <DescriptionOutlinedIcon style={defaultStyle} />;
    case 'archives':
      return <ArchiveOutlinedIcon style={defaultStyle} />;
    case 'code':
      return <CodeOutlinedIcon style={defaultStyle} />;
    default:
      return <InsertDriveFileOutlinedIcon style={defaultStyle} />;
  }
};

export default class FileExplorerTableBodyListWrapperRender extends PureComponent {
  constructor(props) {
    super(props);

    this.animationFrame = null;
    this.itemIndexSource = null;
    this.itemIndexByPath = new Map();
    this.scrollContainer = null;
    this.selectedPathsSource = null;
    this.selectedPathsSet = new Set();
    this.state = {
      source: props.tableSort,
      rowHeight: DEFAULT_ROW_HEIGHT,
      startIndex: 0,
      endIndex: Math.min(props.tableSort.length, 75),
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
        endIndex: Math.min(props.tableSort.length, 75),
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

    window.addEventListener('resize', this.scheduleWindowUpdate);
    this.scheduleWindowUpdate();
  }

  componentDidUpdate(prevProps, prevState) {
    const { tableSort, selectedPaths, multiSelectMode } = this.props;
    const { startIndex, endIndex } = this.state;

    if (
      prevProps.tableSort !== tableSort ||
      prevProps.multiSelectMode !== multiSelectMode ||
      prevState.startIndex !== startIndex ||
      prevState.endIndex !== endIndex
    ) {
      this.measureRowHeight();
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

    window.removeEventListener('resize', this.scheduleWindowUpdate);
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

  getTableBodyOffset = () => {
    if (!this.scrollContainer) {
      return 0;
    }

    const tableBody = this.scrollContainer.querySelector('tbody');

    return tableBody ? tableBody.offsetTop : 0;
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
    const { rowHeight } = this.state;

    if (!this.scrollContainer) {
      return;
    }

    const nextWindow = calculateListWindow({
      itemCount: tableSort.length,
      scrollOffset: Math.max(
        0,
        this.scrollContainer.scrollTop - this.getTableBodyOffset()
      ),
      viewportSize: this.scrollContainer.clientHeight,
      itemSize: rowHeight,
      overscan: OVERSCAN_ROWS,
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

  measureRowHeight = () => {
    if (!this.scrollContainer) {
      return;
    }

    const row = this.scrollContainer.querySelector(
      'tr[data-file-explorer-row="true"]'
    );

    if (!row) {
      return;
    }

    const measuredHeight = row.getBoundingClientRect().height;
    const { rowHeight } = this.state;

    if (measuredHeight > 0 && Math.abs(measuredHeight - rowHeight) > 0.5) {
      this.setState({ rowHeight: measuredHeight }, this.scheduleWindowUpdate);
    }
  };

  ensureSelectedItemIsVisible = () => {
    const { selectedPaths } = this.props;
    const { startIndex, endIndex, rowHeight } = this.state;
    const selectedIndex = this.getItemIndex(selectedPaths[0]);

    if (
      selectedIndex < 0 ||
      (selectedIndex >= startIndex && selectedIndex < endIndex) ||
      !this.scrollContainer
    ) {
      return;
    }

    this.scrollContainer.scrollTop =
      this.getTableBodyOffset() + selectedIndex * rowHeight;
    this.scheduleWindowUpdate();
  };

  renderSpacer = (height, key) => {
    if (height <= 0) {
      return null;
    }

    return (
      <TableRow key={key} aria-hidden="true" style={{ height }}>
        <TableCell
          colSpan={6}
          padding="none"
          style={{ height, padding: 0, border: 0 }}
        />
      </TableRow>
    );
  };

  renderGroupedSections = () => {
    const {
      tableSort,
      deviceType,
      _eventTarget,
      getTableData,
      hideColList,
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
          <TableRow
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              background: 'rgba(128,128,128,0.06)',
            }}
            onClick={() => this.toggleSection(group.id)}
          >
            <TableCell
              colSpan={6}
              style={{
                padding: '10px 12px',
                fontWeight: 700,
                fontSize: 12,
                borderBottom: '1px solid rgba(128,128,128,0.12)',
              }}
            >
              <span style={{ marginRight: 6, verticalAlign: 'middle' }}>
                {isCollapsed ? (
                  <KeyboardArrowRightIcon
                    style={{ fontSize: 16, verticalAlign: 'middle' }}
                  />
                ) : (
                  <KeyboardArrowDownIcon
                    style={{ fontSize: 16, verticalAlign: 'middle' }}
                  />
                )}
              </span>
              {renderCategoryIcon(group.id)}
              <span style={{ verticalAlign: 'middle' }}>{group.label}</span>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: 'rgba(128,128,128,0.15)',
                  verticalAlign: 'middle',
                }}
              >
                {count} file
              </span>
            </TableCell>
          </TableRow>

          {!isCollapsed &&
            group.items.map((item) => (
              <FileExplorerTableRowsRender
                key={item.path}
                item={item}
                isSelected={selectedSet.has(item.path)}
                deviceType={deviceType}
                _eventTarget={_eventTarget}
                getTableData={getTableData}
                hideColList={hideColList}
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
      tableSort,
      deviceType,
      _eventTarget,
      getTableData,
      hideColList,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
      multiSelectMode,
      appThemeMode,
      currentBrowsePath,
      orderBy,
    } = this.props;

    if (orderBy === 'extension') {
      return <Fragment>{this.renderGroupedSections()}</Fragment>;
    }

    const { startIndex, endIndex, beforeSize, afterSize } = this.state;
    const selectedSet = this.getSelectedPathsSet();

    return (
      <Fragment>
        {this.renderSpacer(beforeSize, 'virtual-before')}
        {tableSort.slice(startIndex, endIndex).map((item) => (
          <FileExplorerTableRowsRender
            key={item.path}
            item={item}
            isSelected={selectedSet.has(item.path)}
            deviceType={deviceType}
            _eventTarget={_eventTarget}
            getTableData={getTableData}
            hideColList={hideColList}
            onContextMenuClick={onContextMenuClick}
            onTableClick={onTableClick}
            onTableDoubleClick={onTableDoubleClick}
            multiSelectMode={multiSelectMode}
            appThemeMode={appThemeMode}
            currentBrowsePath={currentBrowsePath}
          />
        ))}
        {this.renderSpacer(afterSize, 'virtual-after')}
      </Fragment>
    );
  }
}
