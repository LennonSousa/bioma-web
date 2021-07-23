import { Customer } from '../Customers';
import { Property } from '../Properties';
import { LicensingInfringement } from '../LicensingInfringements';
import { LicensingAuthorization } from '../LicensingAuthorizations';
import { LicensingAgency } from '../LicensingAgencies';
import { LicensingStatus } from '../LicensingStatus';
import { EventLicensing } from '../EventsLicensing';
import { LicensingAttachment } from '../LicensingAttachments';
import { Member } from '../LicensingMembers';

export interface Licensing {
    id: string;
    licensing_number: string;
    expire: string;
    renovation: string;
    deadline: string;
    process_number: string;
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
    events: EventLicensing[];
    attachments: LicensingAttachment[];
    members: Member[];
}