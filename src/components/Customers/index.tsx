import { CustomerDocs } from '../CustomerDocs';
import { CustomerAttachment } from '../CustomerAttachments';

export interface Customer {
    id: string;
    name: string;
    document: string;
    phone: string;
    cellphone: string;
    contacts: string;
    email: string;
    address: string;
    city: string;
    state: string;
    owner: string;
    notes: string;
    warnings: boolean;
    birth: Date;
    created_by: string;
    created_at: Date;
    docs: CustomerDocs[];
    attachments: CustomerAttachment[];
}