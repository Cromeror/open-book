import { SettingsList } from '../settings-list';
import { SECURITY_SETTINGS } from '../settings-data';

export default function SecurityParametersPage() {
  return <SettingsList settings={SECURITY_SETTINGS} />;
}
