import { ReactNode } from 'react';
import FormSectionHeader from './FormSectionHeader';

export interface FormSectionProps {
    children?: ReactNode;
    customHeader?: ReactNode;
    title?: string
    titlePrefix?: ReactNode
}

export const FormSection = ({ children, customHeader, title, titlePrefix }: FormSectionProps) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <FormSectionHeader title={customHeader ?? title} prefix={customHeader ?? titlePrefix}>{customHeader}</FormSectionHeader>
            <div className="p-4">{children}</div>
        </div>
    );
};

export default FormSection;
