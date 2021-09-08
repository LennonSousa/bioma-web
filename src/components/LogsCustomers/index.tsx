import { Customer } from '../Customers';
import { Grant } from '../Users';

export interface LogCustomer {
    id: string;
    accessed_at: Date;
    user: string;
    action: Grant;
    description: string;
    client_ip: string;
    customer: Customer;
}