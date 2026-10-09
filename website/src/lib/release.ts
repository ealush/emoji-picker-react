import { version } from '../../../package.json';

// The repository still has its previous release number while v5 is reviewed.
// A published v5 build automatically stops advertising itself as a preview.
export const isV5Preview = Number(version.split('.')[0]) < 5;
