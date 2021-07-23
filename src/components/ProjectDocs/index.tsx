import { Project } from '../Projects';
import { DocsProject } from '../DocsProject';

export interface ProjectDocs {
    id: string;
    path: string;
    received_at: Date;
    checked: boolean;
    project: Project;
    doc: DocsProject;
}