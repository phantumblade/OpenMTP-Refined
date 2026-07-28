import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Titlebar';
import { toggleWindowSizeOnDoubleClick } from '../../../helpers/titlebarDoubleClick';
import { APP_TITLEBAR_DOM_ID } from '../../../constants/dom';
import { capitalize, isEmpty, niceBytes } from '../../../utils/funcs';
import { getSelectedStorage } from '../../HomePage/actions';
import { getCurrentWindowHash } from '../../../helpers/windowHelper';
import { getDeviceBrand, translate } from '../../../i18n';

class Titlebar extends PureComponent {
  render() {
    const {
      classes: styles,
      mtpDevice,
      mtpStoragesList,
      mtpMode,
      appLanguage,
    } = this.props;

    const selectedStorage = getSelectedStorage(mtpStoragesList);
    const windowHash = getCurrentWindowHash();
    const mtpDeviceInfo = mtpDevice?.info?.mtpDeviceInfo;
    const brand = getDeviceBrand(mtpDeviceInfo?.Manufacturer);
    const model = mtpDeviceInfo?.Model;

    return (
      <div
        onDoubleClick={() => {
          toggleWindowSizeOnDoubleClick();
        }}
        className={styles.root}
        id={APP_TITLEBAR_DOM_ID}
      >
        {/* Only show the device info. on the main window */}
        {windowHash !== '/' ? null : mtpDevice?.isAvailable &&
          mtpDeviceInfo &&
          !isEmpty(selectedStorage?.data?.info) ? (
          <span className={styles.deviceInfo}>
            <span className={styles.deviceModel}>
              {`${brand ? `${brand} ` : ''}${model} (${
                selectedStorage?.data?.name
              }) - `}
            </span>
            {`${niceBytes(
              parseInt(selectedStorage?.data.info?.FreeSpaceInBytes ?? 0, 10)
            )} ${translate(appLanguage, 'Free of')} ${niceBytes(
              parseInt(selectedStorage?.data.info?.MaxCapability ?? 0, 10)
            )}, ${capitalize(mtpMode)} Mode`}
          </span>
        ) : (
          <span className={styles.deviceInfo}>
            {`${capitalize(mtpMode)} Mode`}
          </span>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Titlebar);
