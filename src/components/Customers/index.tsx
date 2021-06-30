import { CustomerType } from '../CustomerTypes';
import { CustomerDocs } from '../CustomerDocs';
import { Property } from '../Properties';
import { Project } from '../Projects';
import { Licensing } from '../Licensings';
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
    type: CustomerType;
    docs: CustomerDocs[];
    properties: Property[];
    projects: Project[];
    licensings: Licensing[];
    attachments: CustomerAttachment[];
    members: Member[];
}