import { translate } from '../i18n';
import { getAppLanguageSetting } from './settings';

// For code without the Redux store (main process menus and dialogs, the
// update windows): translates with the language saved in Settings.
export const translateWithSetting = (key, values) =>
  translate(getAppLanguageSetting(), key, values);
