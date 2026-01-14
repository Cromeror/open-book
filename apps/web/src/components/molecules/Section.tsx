import { ReactNode } from 'react';
import SectionHeader from './SectionHeader';

export interface SectionProps {
    children?: ReactNode;
    customHeader?: ReactNode;
    title?: string
    titlePrefix?: ReactNode
}

export const Section = ({ children, customHeader, title, titlePrefix }: SectionProps) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <SectionHeader title={customHeader ?? title} prefix={customHeader ?? titlePrefix}>{customHeader}</SectionHeader>
            <div className="p-4">{children}</div>
        </div>
    );
};

export default Section;
