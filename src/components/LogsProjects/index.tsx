import { Project } from '../Projects';
import { Grant } from '../Users';

export interface LogProject {
    id: string;
    accessed_at: Date;
    user: string;
    action: Grant;
    description: string;
    client_ip: string;
    project: Project;
}