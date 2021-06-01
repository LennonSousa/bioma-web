import { Customer } from '../Customers';
import { Bank } from '../Banks';
import { Property } from '../Properties';
import { ProjectLine } from '../ProjectLines';
import { ProjectStatus } from '../ProjectStatus';
import { ProjectType } from '../ProjectTypes';
import { EventProject } from '../EventsProject';

export interface Project {
    id: string;
    value: number;
    deal: number;
    paid: boolean,
    paid_date: string,
    contract: string;
    analyst: string,
    analyst_contact: string,
    notes: string;
    warnings: boolean;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    customer: Customer;
    bank: Bank;
    property: Property;
    type: ProjectType;
    status: ProjectStatus;
    line: ProjectLine;
    events: EventProject[];
}