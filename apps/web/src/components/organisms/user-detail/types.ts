import type { User } from '../UserList';

export interface UserDetailProps {
  user: User;
  loading?: boolean;
  onEdit: (user: User) => void;
  onBack: () => void;
}
