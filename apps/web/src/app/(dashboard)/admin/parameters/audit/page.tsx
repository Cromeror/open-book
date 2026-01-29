import { SettingsList } from '../settings-list';
import { AUDIT_SETTINGS } from '../settings-data';

export default function AuditParametersPage() {
  return <SettingsList settings={AUDIT_SETTINGS} />;
}
