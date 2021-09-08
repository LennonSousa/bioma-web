import { Licensing } from '../Licensings';
import { Grant } from '../Users';

export interface LogLicensing {
    id: string;
    accessed_at: Date;
    user: string;
    action: Grant;
    description: string;
    client_ip: string;
    licensing: Licensing;
}