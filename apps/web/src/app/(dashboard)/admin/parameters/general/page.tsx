import { SettingsList } from '../settings-list';
import { GENERAL_SETTINGS } from '../settings-data';

export default function GeneralParametersPage() {
  return <SettingsList settings={GENERAL_SETTINGS} />;
}
