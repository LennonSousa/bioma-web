import { PropertyAttachment } from '../PropertyAttachments';

export interface LogPropertyAttachment {
    id: string;
    accessed_at: Date;
    user: string;
    action: string;
    client_ip: string;
    attachment: PropertyAttachment;
}