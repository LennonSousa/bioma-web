import { LicensingAttachment } from '../LicensingAttachments';

export interface LogLicensingAttachment {
    id: string;
    accessed_at: Date;
    user: string;
    action: string;
    client_ip: string;
    attachment: LicensingAttachment;
}