import { Bank } from '../Banks';

export interface Institution {
    id: string;
    name: string;
    banks: Bank[];
}