import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../helpers/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';

// The strip the window is dragged by. The connected phone and its free
// space are shown in the phone pane's header (ToolbarBody), not here.
class Titlebar extends PureComponent {
  render() {
    const { classes: styles } = this.props;

    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
        id={APP_TITLEBAR_DOM_ID}
      />
    );
  }
}

export default withStyles(styles)(Titlebar);
