import { Project } from '../Projects';

export interface EventProject {
    id: string;
    description: string;
    done: boolean;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    finished_at: Date;
    project: Project;
}