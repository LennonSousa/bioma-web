import { Customer } from '../Customers';
import { PropertyDocs } from '../PropertyDocs';

export interface Property {
    id: string;
    name: string;
    registration: string;
    route: string;
    city: string;
    state: string;
    area: string;
    notes: string;
    warnings: boolean;
    created_by: string;
    created_at: Date;
    customer: Customer;
    docs: PropertyDocs[];
}