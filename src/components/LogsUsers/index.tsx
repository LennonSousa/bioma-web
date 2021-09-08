import { User, Role, Grant } from '../Users';

export interface LogUser {
    id: string;
    accessed_at: Date;
    item: Role;
    description: string;
    action: Grant;
    client_ip: string;
    user: User;
}