import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';
import M3Button from '../../../components/m3/M3Button';
import MaterialSymbol from '../../../components/m3/MaterialSymbol';
import { styles } from '../styles/PhotoBackupGuide';
import { translate } from '../../../i18n';

// The photos on the phone in the "copy only what's new" scene: the ones
// marked `saved` are already on the Mac and stay put, the others fly over.
const PHOTOS = [
  { saved: true },
  { saved: false },
  { saved: true },
  { saved: false },
  { saved: false },
  { saved: true },
];

// a frame longer than the 90ms exit, so the old step has fully faded
const LEAVE_MS = 120;

export const GUIDE_STEPS = [
  {
    scene: 'connect',
    title: 'Connect the phone',
    text: 'Plug the phone in with a USB data cable, unlock it and choose “File transfer” in the Android USB notification.',
  },
  {
    scene: 'folder',
    title: 'Choose a folder on the Mac',
    text: 'The first time, OpenMTP asks where to keep the photos. It remembers the folder, and you can change it whenever you like.',
  },
  {
    scene: 'copy',
    title: 'Only what’s new is copied',
    text: 'OpenMTP compares the phone’s camera folder (DCIM) with the Mac folder and copies only the photos and videos that are missing, in the same sub-folders.',
  },
  {
    scene: 'safe',
    title: 'Nothing is overwritten or deleted',
    text: 'A file with the same name but different content already on the Mac is left alone and reported. Nothing is ever deleted from the phone.',
  },
];

// How photo backup works, in four illustrated steps (an M3 dialog with a
// hero illustration, a page indicator and back/next actions).
class PhotoBackupGuide extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { step: 0, direction: 1, leaving: false };
  }

  componentDidUpdate(prevProps) {
    const { open } = this.props;

    if (open && !prevProps.open) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ step: 0, leaving: false });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.leaveTimer);
  }

  t = (key, values) => {
    const { appLanguage } = this.props;

    return translate(appLanguage, key, values);
  };

  // M3 shared axis (X): the current step slides out towards where the user
  // is heading, then the next one slides in from the other side
  go = (next) => {
    const { step, leaving } = this.state;

    if (next === step || leaving) {
      return;
    }

    const direction = next > step ? 1 : -1;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      this.setState({ step: next, direction });

      return;
    }

    this.setState({ leaving: true, direction });
    this.leaveTimer = setTimeout(() => {
      this.setState({ step: next, leaving: false });
    }, LEAVE_MS);
  };

  renderScene(scene) {
    const { classes } = this.props;

    const phone = (
      <div className={classes.phone}>
        <span className={classes.phoneNotch} />
        {scene === 'copy' ? (
          <div className={classes.photoGrid}>
            {PHOTOS.map(({ saved }, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={classNames(classes.photo, {
                  [classes.photoSaved]: saved,
                  [classes.photoNew]: !saved,
                })}
                // where this tile lands: the middle of the Mac's screen
                style={{
                  '--i': index,
                  '--dx': `${index % 2 ? 210 : 246}px`,
                  '--dy': `${-5 - (Math.floor(index / 2) - 1) * 36}px`,
                }}
              >
                <MaterialSymbol name="image" size={16} fill={1} />
                {saved && (
                  <span className={classes.photoBadge}>
                    <MaterialSymbol name="check" size={12} weight={700} />
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <MaterialSymbol
            name="photo_library"
            size={36}
            fill={1}
            className={classes.phoneIcon}
          />
        )}
      </div>
    );

    const mac = (
      <div className={classes.mac}>
        <div className={classes.macScreen}>
          <MaterialSymbol
            // eslint-disable-next-line no-nested-ternary
            name={scene === 'safe' ? 'verified_user' : 'folder_special'}
            size={40}
            fill={1}
            className={classNames(classes.macIcon, {
              [classes.macIconPop]: scene === 'folder' || scene === 'safe',
            })}
          />
        </div>
        <span className={classes.macBase} />
      </div>
    );

    return (
      <div className={classes.scene} key={scene}>
        {phone}
        <div className={classes.link}>
          {scene === 'connect' ? (
            <>
              <span className={classes.cable} />
              <span className={classes.cablePlug}>
                <MaterialSymbol name="usb" size={20} />
              </span>
            </>
          ) : (
            <MaterialSymbol
              name={scene === 'safe' ? 'block' : 'arrow_forward'}
              size={28}
              weight={600}
              className={classNames(classes.arrow, {
                [classes.arrowMoving]: scene === 'copy',
              })}
            />
          )}
        </div>
        {mac}
      </div>
    );
  }

  render() {
    const { classes, open, onClose, onStart, canStart } = this.props;
    const { step, direction, leaving } = this.state;
    const current = GUIDE_STEPS[step];
    const motion = classNames({
      [classes.leaving]: leaving,
      [classes.fromStart]: !leaving && direction < 0,
    });
    const last = step === GUIDE_STEPS.length - 1;

    return (
      <Dialog
        open={Boolean(open)}
        onClose={onClose}
        maxWidth={false}
        classes={{ paper: classes.paper }}
        aria-labelledby="photo-backup-guide-title"
      >
        <div className={classes.stage}>
          <div
            className={classNames(classes.sceneSlot, motion)}
            key={current.scene}
          >
            {this.renderScene(current.scene)}
          </div>
        </div>
        <div className={classNames(classes.body, motion)} key={step}>
          <span className={classes.stepLabel}>
            {this.t('Step {step} of {total}', {
              step: step + 1,
              total: GUIDE_STEPS.length,
            })}
          </span>
          <h2 id="photo-backup-guide-title" className={classes.title}>
            {this.t(current.title)}
          </h2>
          <p className={classes.text}>{this.t(current.text)}</p>
        </div>
        <div className={classes.footer}>
          <div className={classes.dots} role="tablist">
            {GUIDE_STEPS.map((item, index) => (
              <button
                key={item.scene}
                type="button"
                role="tab"
                aria-selected={index === step}
                aria-label={this.t(item.title)}
                className={classNames(classes.dot, {
                  [classes.dotActive]: index === step,
                })}
                onClick={() => this.go(index)}
              />
            ))}
          </div>
          <div className={classes.actions}>
            {step > 0 && (
              <M3Button
                variant="text"
                size="small"
                onClick={() => this.go(step - 1)}
              >
                {this.t('Back')}
              </M3Button>
            )}
            {!last && (
              <M3Button
                variant="filled"
                size="small"
                onClick={() => this.go(step + 1)}
              >
                {this.t('Next')}
              </M3Button>
            )}
            {last && (
              <M3Button
                variant="filled"
                size="small"
                icon={canStart ? 'backup' : undefined}
                onClick={canStart ? onStart : onClose}
              >
                {this.t(canStart ? 'Back up now' : 'Got it')}
              </M3Button>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(PhotoBackupGuide);
