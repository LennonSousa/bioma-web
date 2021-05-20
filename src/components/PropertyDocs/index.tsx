import { Property } from '../Properties';
import { DocsProperty } from '../DocsProperty';

export interface PropertyDocs {
    id: string;
    path: string;
    received_at: Date;
    checked: boolean;
    property: Property;
    doc: DocsProperty;
}