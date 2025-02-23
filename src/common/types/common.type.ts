import { Branded } from './types';

export type Uuid = Branded<string, 'Uuid'>;
export type Nanoid = Branded<string, 'Nanoid'>;
