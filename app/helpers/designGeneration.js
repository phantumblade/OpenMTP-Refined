import { APP_COLOR_STYLE_TYPE, APP_FONT_FAMILY_TYPE } from '../enums';
import { settingsStorage } from './storageHelper';

// Generation of the app's default look. 2 is the Material 3 Expressive look:
// Google Sans Flex and the Vibrant colour style.
export const DESIGN_GENERATION = 2;

// Settings saved by an older version keep that version's defaults (system
// font, Classic colours) as if the user had chosen them. Move them to the
// current look once; afterwards whatever the user picks in Settings stays.
export const upgradeSavedLook = () => {
  const saved = settingsStorage.getAll();

  if (
    Object.keys(saved).length < 1 ||
    saved.designGeneration >= DESIGN_GENERATION
  ) {
    return;
  }

  settingsStorage.setItems({
    appFontFamily: APP_FONT_FAMILY_TYPE.googleSansFlex,
    appColorStyle: APP_COLOR_STYLE_TYPE.vibrant,
    designGeneration: DESIGN_GENERATION,
  });
};
