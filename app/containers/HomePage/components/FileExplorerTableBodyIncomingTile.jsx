import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import M3ProgressRing from '../../../components/m3/M3ProgressRing';
import { styles as gridStyles } from '../styles/FileExplorerTableBodyGridRender';
import { getFileIcon, getFolderIcon } from '../../../helpers/fileExplorerIcons';
import { incomingItemState } from '../../../helpers/incomingTransfer';
import { FILE_TRANSFER_PHASE } from '../../../helpers/fileTransfer';
import { imgsrc } from '../../../utils/imgsrc';
import { makeFileTransferProgess } from '../selectors';
import { m3Motion } from '../../../styles/m3/tokens';

// An item a running copy is bringing into this folder: shown right away,
// faded, with its own progress ring; it lights up once it has arrived.
const styles = (theme) => ({
  ...gridStyles(theme),
  incoming: {
    cursor: 'default',
    '&:hover': { backgroundColor: 'transparent' },
    '& $fileTypeIcon': {
      opacity: 0.32,
      filter: 'saturate(0.4)',
      transition: `opacity ${m3Motion.defaultEffects}, filter ${m3Motion.defaultEffects}`,
    },
    '& $itemFileName': {
      opacity: 0.6,
      transition: `opacity ${m3Motion.defaultEffects}`,
    },
  },
  incomingDone: {
    animation: '$arrive 520ms cubic-bezier(0.42, 1.67, 0.21, 0.9)',
    '& $fileTypeIcon': { opacity: 1, filter: 'none' },
    '& $itemFileName': { opacity: 1 },
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  '@keyframes arrive': {
    from: { transform: 'scale(0.88)' },
    to: { transform: 'none' },
  },
  ring: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
});

class FileExplorerTableBodyIncomingTile extends PureComponent {
  render() {
    const {
      classes,
      item,
      index,
      items,
      progress,
      deviceType,
      currentBrowsePath,
      appThemeMode,
    } = this.props;
    const state = incomingItemState({
      index,
      items,
      progress,
      done: progress?.phase === FILE_TRANSFER_PHASE.completed,
    });
    const done = state.status === 'done';
    const icon = item.isFolder
      ? getFolderIcon({ item, deviceType, currentBrowsePath, appThemeMode })
      : getFileIcon(item, appThemeMode);

    return (
      <div
        role="option"
        aria-selected="false"
        aria-busy={!done}
        className={classNames(classes.itemWrapper, classes.incoming, {
          [classes.incomingDone]: done,
        })}
      >
        <div className={classes.itemContent}>
          <div className={classes.fileTypeIconWrapper}>
            <img src={imgsrc(icon)} alt="" className={classes.fileTypeIcon} />
            {!done && (
              <M3ProgressRing
                className={classes.ring}
                size={92}
                value={state.status === 'waiting' ? 0 : state.value}
              />
            )}
          </div>
          <div className={classes.itemFileNameWrapper}>
            <Typography variant="caption" className={classes.itemFileName}>
              {item.name}
            </Typography>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  progress: makeFileTransferProgess(state),
});

export default connect(mapStateToProps)(
  withStyles(styles)(FileExplorerTableBodyIncomingTile)
);
