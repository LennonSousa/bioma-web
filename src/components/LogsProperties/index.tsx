import { Property } from '../Properties';
import { Grant } from '../Users';

export interface LogProperty {
    id: string;
    accessed_at: Date;
    user: string;
    action: Grant;
    description: string;
    client_ip: string;
    property: Property;
}