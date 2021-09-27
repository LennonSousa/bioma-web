import { CustomerType } from '../CustomerTypes';
import { CustomerDoc } from '../CustomerDocs';
import { Property } from '../Properties';
import { Project } from '../Projects';
import { Licensing } from '../Licensings';
import { CustomerAttachment } from '../CustomerAttachments';
import { Member } from '../CustomerMembers';
import { LogCustomer } from '../LogsCustomers';

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
    warnings_text: string,
    birth: Date;
    created_by: string;
    created_at: Date;
    type: CustomerType;
    docs: CustomerDoc[];
    properties: Property[];
    projects: Project[];
    licensings: Licensing[];
    attachments: CustomerAttachment[];
    members: Member[];
    logs: LogCustomer[];
}