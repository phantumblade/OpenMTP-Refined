import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import HomeIcon from '@material-ui/icons/Home';
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import GetAppIcon from '@material-ui/icons/GetApp';
import StorageIcon from '@material-ui/icons/Storage';
import ComputerIcon from '@material-ui/icons/Computer';
import TuneIcon from '@material-ui/icons/Tune';
import RefreshIcon from '@material-ui/icons/Refresh';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import SlotText from '../../../components/SlotText';
import { styles } from '../styles/SidebarAreaPaneLists';
import { quickHash, capitalize } from '../../../utils/funcs';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { translate } from '../../../i18n';
import { APP_NAME, APP_VERSION } from '../../../constants/meta';

class SidebarAreaPaneLists extends PureComponent {
  _handleListDirectory = ({ filePath, deviceType, isSidemenu }) => {
    const { onClickHandler, onToggleDrawer } = this.props;

    analyticsService.sendEvent(EVENT_TYPE.NAVIGATE, {
      path: filePath,
    });

    onClickHandler({
      filePath,
      deviceType,
      isSidemenu,
    });

    if (onToggleDrawer) {
      onToggleDrawer(false)();
    }
  };

  _handleAction = (actionFn) => {
    const { onToggleDrawer } = this.props;

    if (typeof actionFn === 'function') {
      actionFn();
    }

    if (onToggleDrawer) {
      onToggleDrawer(false)();
    }
  };

  renderFavorites = (listData) => {
    const {
      classes: styles,
      currentBrowsePath,
      appLanguage,
      deviceType,
    } = this.props;

    const icons = {
      Home: <HomeIcon />,
      Desktop: <DesktopMacIcon />,
      Downloads: <GetAppIcon />,
      'Removable Disks': <StorageIcon />,
      Root: <ComputerIcon />,
    };

    return (
      <List component="nav" dense className={styles.listNav}>
        {listData.map((item) => {
          const isSelected = currentBrowsePath === item.path;

          return (
            <ListItem
              key={quickHash(item.path)}
              button
              selected={isSelected}
              disabled={!item.enabled}
              className={styles.listItem}
              onClick={() =>
                this._handleListDirectory({
                  filePath: item.path,
                  deviceType,
                  isSidemenu: true,
                })
              }
            >
              <ListItemIcon className={styles.listItemIcon}>
                {icons[item.label] || <StorageIcon />}
              </ListItemIcon>
              <ListItemText
                className={styles.listItemText}
                primary={translate(appLanguage, item.label)}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  render() {
    const {
      classes: styles,
      sidebarFavouriteList,
      appLanguage,
      mtpMode,
      onOpenSettings,
      onRefresh,
      onSelectStorage,
      onSelectMtpMode,
    } = this.props;

    const { top: sidebarTop, bottom: sidebarBottom } = sidebarFavouriteList;
    const isItalian = appLanguage === 'it';

    return (
      <div className={styles.listsWrapper}>
        {/* Header Block */}
        <div className={styles.headerBlock}>
          <div className={styles.headerTitleRow}>
            <PhoneAndroidIcon className={styles.headerIcon} />
            <div>
              <div className={styles.headerTitle}>{APP_NAME}</div>
              <div className={styles.headerSubtitle}>
                {isItalian
                  ? 'Trasferimento File Android per macOS'
                  : 'Android File Transfer for macOS'}
              </div>
            </div>
          </div>
          {mtpMode && (
            <div className={styles.modeBadge}>
              <span className={styles.modeBadgeDot} />
              <SlotText text={`${capitalize(mtpMode)} Mode`} />
            </div>
          )}
        </div>

        {/* Content Scroll Area */}
        <div className={styles.contentScrollArea}>
          {/* Posizioni Rapide / Favorites */}
          <Typography variant="caption" className={styles.sectionCaption}>
            {isItalian ? 'Posizioni Rapide' : 'Quick Access'}
          </Typography>
          {sidebarTop &&
            sidebarTop.length > 0 &&
            this.renderFavorites(sidebarTop)}
          {sidebarBottom && sidebarBottom.length > 0 && (
            <>
              <Divider className={styles.sectionDivider} />
              {this.renderFavorites(sidebarBottom)}
            </>
          )}

          <Divider className={styles.sectionDivider} />

          {/* Strumenti & Azioni / Tools & Actions */}
          <Typography variant="caption" className={styles.sectionCaption}>
            {isItalian ? 'Strumenti & Azioni' : 'Tools & Actions'}
          </Typography>
          <List component="nav" dense className={styles.listNav}>
            {onRefresh && (
              <ListItem
                button
                className={styles.listItem}
                onClick={() => this._handleAction(onRefresh)}
              >
                <ListItemIcon className={styles.listItemIcon}>
                  <RefreshIcon />
                </ListItemIcon>
                <ListItemText
                  className={styles.listItemText}
                  primary={isItalian ? 'Aggiorna Elenco' : 'Refresh List'}
                />
              </ListItem>
            )}

            {onSelectStorage && (
              <ListItem
                button
                className={styles.listItem}
                onClick={() => this._handleAction(onSelectStorage)}
              >
                <ListItemIcon className={styles.listItemIcon}>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText
                  className={styles.listItemText}
                  primary={isItalian ? 'Cambia Memoria' : 'Select Storage'}
                />
              </ListItem>
            )}

            {onSelectMtpMode && (
              <ListItem
                button
                className={styles.listItem}
                onClick={() => this._handleAction(onSelectMtpMode)}
              >
                <ListItemIcon className={styles.listItemIcon}>
                  <FlashOnIcon />
                </ListItemIcon>
                <ListItemText
                  className={styles.listItemText}
                  primary={isItalian ? 'Modalità MTP' : 'MTP Mode'}
                />
              </ListItem>
            )}

            {onOpenSettings && (
              <ListItem
                button
                className={styles.listItem}
                onClick={() => this._handleAction(onOpenSettings)}
              >
                <ListItemIcon className={styles.listItemIcon}>
                  <TuneIcon />
                </ListItemIcon>
                <ListItemText
                  className={styles.listItemText}
                  primary={isItalian ? 'Impostazioni' : 'Settings'}
                />
              </ListItem>
            )}
          </List>
        </div>

        {/* Footer Block */}
        <div className={styles.footerBlock}>
          <div className={styles.footerIconWrapper}>
            <PhoneAndroidIcon style={{ fontSize: 16 }} />
          </div>
          <div className={styles.footerMeta}>
            <span className={styles.footerAppName}>
              {`${APP_NAME} v${APP_VERSION}`}
            </span>
            <span className={styles.footerAppSub}>
              {isItalian ? 'Ottimizzato per macOS' : 'Crafted for macOS'}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SidebarAreaPaneLists);
