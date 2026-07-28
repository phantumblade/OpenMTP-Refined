import React, { PureComponent } from 'react';
import { pathToFileURL } from 'url';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyGridRender';
import { imgsrc } from '../../../utils/imgsrc';
import {
  getFileIcon,
  getFolderIcon,
  isLocalImage,
  isLocalVideo,
} from '../../../helpers/fileExplorerIcons';
import {
  previewLoadManager,
  downscaleImage,
  requestNativeQuickLookThumbnail,
  isRawImageFormat,
} from '../../../helpers/previewLoadManager';
import SelectionCheckbox from '../../../components/SelectionCheckbox';

class FileExplorerTableBodyGridRender extends PureComponent {
  constructor(props) {
    super(props);

    const previewKey = previewLoadManager.createPreviewKey(props.item);
    const cachedThumbnail = previewLoadManager.getThumbnail(previewKey);

    this.state = {
      previewFailed: false,
      videoReady: false,
      cachedThumbnail,
      isPreviewVisible:
        Boolean(cachedThumbnail) || previewLoadManager.isReady(previewKey),
    };

    this.cancelPreviewObservation = null;
    this.previewCompletion = null;
    this.itemWrapper = null;
  }

  componentDidMount() {
    this.observePreview();
  }

  componentDidUpdate(prevProps) {
    const { item, deviceType } = this.props;
    const previousKey = previewLoadManager.createPreviewKey(prevProps.item);
    const nextKey = previewLoadManager.createPreviewKey(item);

    if (previousKey !== nextKey || prevProps.deviceType !== deviceType) {
      const cachedThumbnail = previewLoadManager.getThumbnail(nextKey);

      this.cancelPreview();
      this.setState(
        {
          previewFailed: false,
          videoReady: false,
          cachedThumbnail,
          isPreviewVisible:
            Boolean(cachedThumbnail) || previewLoadManager.isReady(nextKey),
        },
        this.observePreview
      );
    }
  }

  componentWillUnmount() {
    this.cancelPreview();
  }

  observePreview = () => {
    const { item, deviceType } = this.props;
    const { isPreviewVisible } = this.state;

    if (
      isPreviewVisible ||
      (!isLocalImage(item, deviceType) && !isLocalVideo(item, deviceType))
    ) {
      return;
    }

    if (!this.itemWrapper) {
      return;
    }

    this.cancelPreviewObservation = previewLoadManager.observe({
      element: this.itemWrapper,
      key: previewLoadManager.createPreviewKey(item),
      onStart: async (complete) => {
        this.previewCompletion = complete;
        if (isRawImageFormat(item.path) || isLocalVideo(item, deviceType)) {
          const quickLookUrl = await requestNativeQuickLookThumbnail(item.path);

          if (quickLookUrl) {
            const key = previewLoadManager.createPreviewKey(item);

            previewLoadManager.setThumbnail(key, quickLookUrl);
            this.setState({
              cachedThumbnail: quickLookUrl,
              isPreviewVisible: true,
            });
            this.completePreview(true);

            return;
          }
        }

        this.setState({ isPreviewVisible: true });
      },
    });
  };

  cancelPreview = () => {
    if (this.cancelPreviewObservation) {
      this.cancelPreviewObservation();
      this.cancelPreviewObservation = null;
    }

    this.previewCompletion = null;
  };

  completePreview = (cacheResult) => {
    if (!this.previewCompletion) {
      return;
    }

    const complete = this.previewCompletion;

    this.previewCompletion = null;
    complete(cacheResult);
  };

  canRenderLocalPreview = () => {
    const { deviceType, item } = this.props;
    const { previewFailed, isPreviewVisible } = this.state;

    return isPreviewVisible && !previewFailed && isLocalImage(item, deviceType);
  };

  canRenderLocalVideoPreview = () => {
    const { deviceType, item } = this.props;
    const { previewFailed, isPreviewVisible } = this.state;
    const MAX_VIDEO_PREVIEW_SIZE = 400 * 1024 * 1024; // 400MB

    return (
      isPreviewVisible &&
      !previewFailed &&
      isLocalVideo(item, deviceType) &&
      (item.size || 0) <= MAX_VIDEO_PREVIEW_SIZE
    );
  };

  _handleVideoMetadata = (event) => {
    const video = event.currentTarget;

    try {
      video.currentTime = Math.min(0.15, Math.max(video.duration / 20, 0.01));
    } catch (_) {
      this.completePreview(false);
      this.setState({ previewFailed: true });
    }
  };

  _handlePreviewReady = (event) => {
    const { item } = this.props;
    const { cachedThumbnail } = this.state;
    const key = previewLoadManager.createPreviewKey(item);

    if (event && event.currentTarget && !cachedThumbnail) {
      const dataUrl = downscaleImage(event.currentTarget);

      if (dataUrl) {
        previewLoadManager.setThumbnail(key, dataUrl);
        this.setState({ cachedThumbnail: dataUrl });
      } else {
        previewLoadManager.setThumbnail(key, true);
      }
    } else {
      previewLoadManager.setThumbnail(key, true);
    }

    this.completePreview(true);
  };

  _handlePreviewError = async () => {
    const { item } = this.props;

    if (item && item.path) {
      const quickLookUrl = await requestNativeQuickLookThumbnail(item.path);

      if (quickLookUrl) {
        const key = previewLoadManager.createPreviewKey(item);

        previewLoadManager.setThumbnail(key, quickLookUrl);
        this.setState({ cachedThumbnail: quickLookUrl, previewFailed: false });
        this.completePreview(true);

        return;
      }
    }

    this.completePreview(false);
    this.setState({ previewFailed: true });
  };

  _handleVideoReady = () => {
    this.completePreview(true);
    this.setState({ videoReady: true });
  };

  RenderFileIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      getTableData,
      onContextMenuClick,
      appThemeMode,
      deviceType,
    } = this.props;
    const { cachedThumbnail } = this.state;

    const themedFileIcon = getFileIcon(item, appThemeMode);

    if (cachedThumbnail) {
      const isVid = isLocalVideo(item, deviceType);

      return (
        <div className={styles.fileTypeIconWrapper}>
          <div className={classNames({ [styles.videoPreviewWrapper]: isVid })}>
            <img
              src={cachedThumbnail}
              alt={`Preview of ${item.name}`}
              className={classNames(styles.filePreview)}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...getTableData() },
                  _eventTarget
                )
              }
            />
            {isVid && (
              <span className={styles.videoPlayBadge}>
                <PlayArrowIcon />
              </span>
            )}
          </div>
        </div>
      );
    }

    if (this.canRenderLocalPreview()) {
      return (
        <div className={styles.fileTypeIconWrapper}>
          <img
            src={pathToFileURL(item.path).toString()}
            alt={`Preview of ${item.name}`}
            className={classNames(styles.filePreview)}
            loading="lazy"
            decoding="async"
            onLoad={this._handlePreviewReady}
            onError={this._handlePreviewError}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...getTableData() },
                _eventTarget
              )
            }
          />
        </div>
      );
    }

    if (this.canRenderLocalVideoPreview()) {
      const { videoReady } = this.state;

      return (
        <div className={styles.fileTypeIconWrapper}>
          <div className={styles.videoPreviewWrapper}>
            <video
              src={pathToFileURL(item.path).toString()}
              aria-label={`Preview of ${item.name}`}
              className={classNames(styles.filePreview, {
                [styles.videoPreviewLoading]: !videoReady,
              })}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={this._handleVideoMetadata}
              onSeeked={this._handleVideoReady}
              onError={this._handlePreviewError}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...getTableData() },
                  _eventTarget
                )
              }
            />
            <span className={styles.videoPlayBadge}>
              <PlayArrowIcon />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(themedFileIcon)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...getTableData() },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

  RenderFolderIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      getTableData,
      onContextMenuClick,
      deviceType,
      currentBrowsePath,
      appThemeMode,
    } = this.props;

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(
            getFolderIcon({
              item,
              deviceType,
              currentBrowsePath,
              appThemeMode,
            })
          )}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...getTableData() },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      isSelected,
      item,
      deviceType,
      _eventTarget,
      getTableData,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
      multiSelectMode,
    } = this.props;
    const { RenderFileIcon, RenderFolderIcon } = this;

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS
    );
    const isMultiSelectMode = multiSelectMode[deviceType];

    return (
      <div
        ref={(element) => {
          this.itemWrapper = element;
        }}
        draggable="true"
        role="option"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        className={classNames(styles.itemWrapper, {
          [styles.itemMultiSelect]: isMultiSelectMode,
          [styles.itemSelected]: isSelected && !isMultiSelectMode,
          [styles.itemSelectedMulti]: isSelected && isMultiSelectMode,
        })}
        onClick={(event) => onTableClick(item.path, deviceType, event, 'row')}
        onDoubleClick={(event) => onTableDoubleClick(item, deviceType, event)}
        onContextMenu={(event) =>
          onContextMenuClick(
            event,
            { ...item },
            { ...getTableData() },
            _eventTarget
          )
        }
        onDragStart={(event) => {
          if (!isSelected) {
            onTableClick(item.path, deviceType, event, 'replace');
          }
        }}
      >
        <div className={styles.itemContent}>
          {isMultiSelectMode && (
            <SelectionCheckbox
              className={styles.itemCheckBox}
              checked={isSelected}
              inputProps={{ 'aria-label': `Select ${item.name}` }}
              onClick={(event) => {
                event.stopPropagation();
                onTableClick(item.path, deviceType, event, 'toggle');
              }}
            />
          )}
          {item.isFolder ? <RenderFolderIcon /> : <RenderFileIcon />}
          <div className={styles.itemFileNameWrapper}>
            <Typography
              variant="caption"
              className={styles.itemFileName}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...getTableData() },
                  _eventTarget
                )
              }
            >
              {fileName.isTruncated ? (
                <Tooltip title={fileName.text}>
                  <div className={styles.truncate}>
                    {fileName.truncatedText}
                  </div>
                </Tooltip>
              ) : (
                fileName.text
              )}
            </Typography>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridRender);
