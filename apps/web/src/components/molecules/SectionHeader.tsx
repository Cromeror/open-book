import { ReactNode } from 'react';

export interface SectionHeaderProps {
  children?: ReactNode;
  prefix?: ReactNode;
  title?: ReactNode;
}

export const SectionHeader = ({ children, title, prefix }: SectionHeaderProps) => {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
      {prefix}
      <h5 className="text-base font-medium text-gray-700">{title ?? "--"}</h5>
      {children}
    </div>
  );
};

export default SectionHeader;
