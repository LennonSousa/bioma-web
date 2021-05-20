import { Institution } from '../Institutions';
import { Project } from '../Projects';

export interface Bank {
    id: string;
    agency: string;
    address: string;
    city: string;
    state: string;
    sector: string;
    department: string;
    phone: string;
    cellphone: string;
    institution: Institution;
    projects: Project[];
}