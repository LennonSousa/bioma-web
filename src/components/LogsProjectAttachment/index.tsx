import { ProjectAttachment } from '../ProjectAttachments';

export interface LogProjectAttachment {
    id: string;
    accessed_at: Date;
    user: string;
    action: string;
    attachment: ProjectAttachment;
}