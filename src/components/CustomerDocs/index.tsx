import { Customer } from '../Customers';
import { DocsCustomer } from '../DocsCustomer';

export interface CustomerDocs {
    id: string;
    path: string;
    received_at: Date;
    checked: boolean;
    customer: Customer;
    doc: DocsCustomer;
}