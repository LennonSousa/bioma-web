import { CustomerDocs } from '../CustomerDocs';
import { Property } from '../Properties';
import { Project } from '../Projects';
import { CustomerAttachment } from '../CustomerAttachments';
import { Member } from '../CustomerMembers';

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
    properties: Property[];
    projects: Project[];
    attachments: CustomerAttachment[];
    members: Member[];
}