import { Customer } from '../Customers';
import { PropertyDocs } from '../PropertyDocs';
import { PropertyAttachment } from '../PropertyAttachments';
import { Member } from '../PropertyMembers';

export interface Property {
    id: string;
    name: string;
    registration: string;
    route: string;
    city: string;
    state: string;
    area: string;
    coordinates: string;
    notes: string;
    warnings: boolean;
    warnings_text: string,
    created_by: string;
    created_at: Date;
    customer: Customer;
    docs: PropertyDocs[];
    attachments: PropertyAttachment[];
    members: Member[];
}