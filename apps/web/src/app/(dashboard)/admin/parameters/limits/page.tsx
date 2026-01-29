import { SettingsList } from '../settings-list';
import { LIMITS_SETTINGS } from '../settings-data';

export default function LimitsParametersPage() {
  return <SettingsList settings={LIMITS_SETTINGS} />;
}
