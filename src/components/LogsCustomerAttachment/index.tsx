import { CustomerAttachment } from '../CustomerAttachments';

export interface LogCustomerAttachment {
    id: string;
    accessed_at: Date;
    user: string;
    action: string;
    attachment: CustomerAttachment;
}