import React, { PureComponent } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/FileExplorerSearchBar';
import {
  FILE_SEARCH_DEBOUNCE_MS,
  FILE_SEARCH_MIN_QUERY_LENGTH,
  searchFileTreeBreadthFirst,
} from '../../../helpers/fileSearch';
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';
import { DEVICE_TYPE } from '../../../enums';
import { getFileIcon, getFolderIcon } from '../../../helpers/fileExplorerIcons';
import { imgsrc } from '../../../utils/imgsrc';
import { translate } from '../../../i18n';
import { isTransferPhaseActive } from '../../../helpers/fileTransfer';
import FileExplorerDateFilter from './FileExplorerDateFilter';
import FileExplorerTypeFilter from './FileExplorerTypeFilter';

class FileExplorerSearchBar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      results: [],
      isOpen: false,
      isPending: false,
      isSearching: false,
      hasSearched: false,
      truncated: false,
      directoriesScanned: 0,
      activeIndex: -1,
    };
    this.searchTimer = null;
    this.searchVersion = 0;
    this.lastProgressUpdate = 0;
  }

  componentDidUpdate(prevProps) {
    const { rootPath, deviceType, rootNodes, fileTransferProgress } =
      this.props;
    const { query } = this.state;

    if (
      prevProps.rootPath !== rootPath ||
      prevProps.deviceType !== deviceType
    ) {
      this.clearSearch();

      return;
    }

    if (prevProps.rootNodes !== rootNodes && query.trim()) {
      this.scheduleSearch(query);
    }

    if (
      deviceType === DEVICE_TYPE.mtp &&
      !isTransferPhaseActive(prevProps.fileTransferProgress?.phase) &&
      isTransferPhaseActive(fileTransferProgress?.phase)
    ) {
      window.clearTimeout(this.searchTimer);
      this.searchVersion += 1;
      this.setState({
        isPending: false,
        isSearching: false,
        isOpen: false,
      });
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.searchTimer);
    this.searchVersion += 1;
  }

  scheduleSearch = (query) => {
    window.clearTimeout(this.searchTimer);
    this.searchVersion += 1;

    if (query.trim().length < FILE_SEARCH_MIN_QUERY_LENGTH) {
      this.setState({
        results: [],
        isOpen: query.length > 0,
        isPending: false,
        isSearching: false,
        hasSearched: false,
        truncated: false,
        directoriesScanned: 0,
        activeIndex: -1,
      });

      return;
    }

    const version = this.searchVersion;

    this.setState({
      results: [],
      isOpen: true,
      isPending: true,
      isSearching: false,
      hasSearched: false,
      truncated: false,
      directoriesScanned: 0,
      activeIndex: -1,
    });
    this.searchTimer = window.setTimeout(
      () => this.performSearch(query.trim(), version),
      FILE_SEARCH_DEBOUNCE_MS
    );
  };

  performSearch = async (query, version) => {
    const {
      rootPath,
      rootNodes,
      deviceType,
      storageId,
      ignoreHidden,
      mtpDevice,
      fileTransferProgress,
    } = this.props;
    const isCancelled = () => version !== this.searchVersion;

    if (
      deviceType === DEVICE_TYPE.mtp &&
      (!mtpDevice?.isAvailable ||
        isTransferPhaseActive(fileTransferProgress?.phase))
    ) {
      return;
    }

    this.lastProgressUpdate = 0;
    this.setState({
      results: [],
      isPending: false,
      isSearching: true,
      hasSearched: false,
      truncated: false,
      directoriesScanned: 0,
      activeIndex: -1,
    });

    const listFiles = async (filePath) => {
      const { data, error } = await fileExplorerController.listFilesForSearch({
        deviceType,
        filePath,
        ignoreHidden,
        storageId: deviceType === DEVICE_TYPE.mtp ? storageId : null,
        isCancelled,
      });

      return error ? [] : data;
    };

    const searchResult = await searchFileTreeBreadthFirst({
      rootPath,
      rootNodes,
      query,
      deviceType,
      listFiles,
      isCancelled,
      onProgress: ({ results, directoriesScanned }) => {
        const now = Date.now();

        if (isCancelled() || now - this.lastProgressUpdate < 160) {
          return;
        }

        this.lastProgressUpdate = now;
        this.setState({ results, directoriesScanned });
      },
    });

    if (searchResult.cancelled || isCancelled()) {
      return;
    }

    this.setState({
      results: searchResult.results,
      isPending: false,
      isSearching: false,
      hasSearched: true,
      truncated: searchResult.truncated,
      directoriesScanned: searchResult.directoriesScanned,
      activeIndex: searchResult.results.length > 0 ? 0 : -1,
    });
  };

  clearSearch = () => {
    window.clearTimeout(this.searchTimer);
    this.searchVersion += 1;
    this.setState({
      query: '',
      results: [],
      isOpen: false,
      isPending: false,
      isSearching: false,
      hasSearched: false,
      truncated: false,
      directoriesScanned: 0,
      activeIndex: -1,
    });
  };

  handleChange = (event) => {
    const query = event.target.value;

    this.setState({ query });
    this.scheduleSearch(query);
  };

  handleKeyDown = (event) => {
    const { results, activeIndex } = this.state;

    switch (event.key) {
      case 'ArrowDown':
        if (results.length > 0) {
          event.preventDefault();
          this.setState({
            activeIndex: Math.min(results.length - 1, activeIndex + 1),
          });
        }

        break;

      case 'ArrowUp':
        if (results.length > 0) {
          event.preventDefault();
          this.setState({ activeIndex: Math.max(0, activeIndex - 1) });
        }

        break;

      case 'Enter':
        if (activeIndex > -1 && results[activeIndex]) {
          event.preventDefault();
          this.openResult(results[activeIndex]);
        }

        break;

      case 'Escape':
        event.preventDefault();
        this.clearSearch();
        break;

      default:
        break;
    }
  };

  openResult = (result) => {
    const { onOpenResult } = this.props;

    onOpenResult(result);
    this.clearSearch();
  };

  renderHighlightedName = (result) => {
    const matchedPositions = new Set(result.match.positions);

    return Array.from(result.name).map((character, index) =>
      matchedPositions.has(index) ? (
        // eslint-disable-next-line react/no-array-index-key
        <mark key={`${character}-${index}`}>{character}</mark>
      ) : (
        character
      )
    );
  };

  renderResultIcon = (result) => {
    const { deviceType, rootPath, appThemeMode } = this.props;
    const icon = result.isFolder
      ? getFolderIcon({
          item: result,
          deviceType,
          currentBrowsePath: { [deviceType]: rootPath },
          appThemeMode,
        })
      : getFileIcon(result, appThemeMode);

    return imgsrc(icon);
  };

  render() {
    const {
      classes: styles,
      appLanguage,
      deviceType,
      mtpDevice,
      fileTransferProgress,
      dateFilter,
      onDateFilterChange,
      creationDateAvailable,
      fileTypeFilter,
      fileTypeOptions,
      onFileTypeFilterChange,
    } = this.props;
    const {
      query,
      results,
      isOpen,
      isPending,
      isSearching,
      hasSearched,
      truncated,
      directoriesScanned,
      activeIndex,
    } = this.state;
    const t = (key, values) => translate(appLanguage, key, values);
    const isDisabled =
      deviceType === DEVICE_TYPE.mtp &&
      (!mtpDevice?.isAvailable ||
        isTransferPhaseActive(fileTransferProgress?.phase));
    const showMinimumHint =
      query.length > 0 && query.trim().length < FILE_SEARCH_MIN_QUERY_LENGTH;

    return (
      <div className={styles.root}>
        <div className={styles.inputShell}>
          <SearchIcon className={styles.searchIcon} />
          <InputBase
            value={query}
            disabled={isDisabled}
            placeholder={t('Search files and folders')}
            inputProps={{
              'aria-label': t('Search files and folders'),
              role: 'combobox',
              'aria-expanded': isOpen,
              'aria-controls': `${deviceType}-file-search-results`,
              'aria-autocomplete': 'list',
            }}
            className={styles.input}
            onChange={this.handleChange}
            onFocus={() => {
              if (query.length > 0) {
                this.setState({ isOpen: true });
              }
            }}
            onKeyDown={this.handleKeyDown}
          />
          {isSearching && (
            <CircularProgress
              size={16}
              thickness={5}
              className={styles.progress}
              aria-label={t('Searching')}
            />
          )}
          {query.length > 0 && (
            <Tooltip title={t('Clear search')}>
              <IconButton
                size="small"
                disableRipple
                aria-label={t('Clear search')}
                className={styles.clearButton}
                onClick={this.clearSearch}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
          <span className={styles.filterDivider} aria-hidden="true" />
          <span className={styles.filterActions}>
            <FileExplorerTypeFilter
              value={fileTypeFilter}
              options={fileTypeOptions}
              disabled={isDisabled}
              appLanguage={appLanguage}
              onChange={onFileTypeFilterChange}
            />
            <FileExplorerDateFilter
              value={dateFilter}
              disabled={isDisabled}
              creationDateAvailable={creationDateAvailable}
              appLanguage={appLanguage}
              deviceType={deviceType}
              onChange={onDateFilterChange}
            />
          </span>
        </div>

        {isOpen && (
          <div
            id={`${deviceType}-file-search-results`}
            role="listbox"
            tabIndex={-1}
            className={styles.resultsPanel}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className={styles.resultsMeta} aria-live="polite">
              {showMinimumHint && t('Type at least 2 characters')}
              {!showMinimumHint &&
                isPending &&
                t('Waiting for typing to finish')}
              {!showMinimumHint &&
                !isPending &&
                !isSearching &&
                hasSearched && (
                  <>
                    {t('{count} results', { count: results.length })}
                    <span>
                      {t('{count} folders scanned', {
                        count: directoriesScanned,
                      })}
                    </span>
                  </>
                )}
              {isSearching && (
                <>
                  {t('Searching')}
                  <span>
                    {t('{count} folders scanned', {
                      count: directoriesScanned,
                    })}
                  </span>
                </>
              )}
            </div>

            {!showMinimumHint && !isPending && results.length > 0 && (
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    key={result.path}
                    className={
                      activeIndex === index
                        ? `${styles.result} ${styles.resultActive}`
                        : styles.result
                    }
                    onMouseEnter={() => this.setState({ activeIndex: index })}
                    onClick={() => this.openResult(result)}
                  >
                    <img
                      src={this.renderResultIcon(result)}
                      alt=""
                      className={styles.resultIcon}
                    />
                    <span className={styles.resultText}>
                      <span className={styles.resultName}>
                        {this.renderHighlightedName(result)}
                      </span>
                      <span
                        className={styles.resultPath}
                        title={result.parentPath}
                      >
                        {result.relativeParentPath === '.'
                          ? t('Current folder')
                          : result.relativeParentPath}
                      </span>
                    </span>
                    {result.isFolder && (
                      <FolderOutlinedIcon className={styles.folderIndicator} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {!showMinimumHint &&
              !isPending &&
              !isSearching &&
              hasSearched &&
              results.length === 0 && (
                <div className={styles.emptyResult}>
                  {t('No matching files or folders')}
                </div>
              )}

            {truncated && (
              <div className={styles.limitNotice}>
                {t('Search stopped at the safety limit')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerSearchBar);
