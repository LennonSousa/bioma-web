import { Customer } from '../Customers';
import { Property } from '../Properties';
import { LicensingInfringement } from '../LicensingInfringements';
import { LicensingAuthorization } from '../LicensingAuthorizations';
import { LicensingAgency } from '../LicensingAgencies';
import { LicensingStatus } from '../LicensingStatus';
import { Bank } from '../Banks';
import { ProjectLine } from '../ProjectLines';
import { ProjectType } from '../ProjectTypes';
import { EventLicensing } from '../EventsLicensing';
import { LicensingAttachment } from '../LicensingAttachments';
import { Member } from '../LicensingMembers';
import { LogLicensing } from '../LogsLicensings';

export interface Licensing {
    id: string;
    licensing_number: string;
    expire: string;
    renovation: string;
    deadline: string;
    process_number: string;
    value: number;
    deal: number;
    paid: boolean,
    paid_date: string,
    contract: string;
    notes: string;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    customer: Customer;
    property: Property;
    infringement: LicensingInfringement;
    authorization: LicensingAuthorization;
    agency: LicensingAgency;
    status: LicensingStatus;
    bank: Bank;
    type: ProjectType;
    line: ProjectLine;
    events: EventLicensing[];
    attachments: LicensingAttachment[];
    members: Member[];
    logs: LogLicensing[];
}