import { SkinTones } from '../types/exposedTypes';

const SKINTONE_LS_KEY = 'epr_skin_tone';


export function getSkinTone(): SkinTones {
  try {
    if (!window?.localStorage) {
      return SkinTones.NEUTRAL;
    }

    return JSON.parse(window?.localStorage.getItem(SKINTONE_LS_KEY) ?? SkinTones.NEUTRAL)
  } catch {
    return SkinTones.NEUTRAL;
  }
}

export function setSkinTone(skinTone: SkinTones) {
  try {
    window?.localStorage.setItem(SKINTONE_LS_KEY, JSON.stringify(skinTone));
    // Prevents the change from being seen immediately.
  } catch {
    // ignore
  }
}