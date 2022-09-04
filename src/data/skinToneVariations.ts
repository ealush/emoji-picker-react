import { SkinTones } from '../types/exposedTypes';

const skinToneVariations = [
  SkinTones.NEUTRAL,
  SkinTones.LIGHT,
  SkinTones.MEDIUM_LIGHT,
  SkinTones.MEDIUM,
  SkinTones.MEDIUM_DARK,
  SkinTones.DARK
];

export const skinTonesMapped: Record<
  string,
  string
> = skinToneVariations.reduce(
  (mapped, skinTone) =>
    Object.assign(mapped, {
      [skinTone]: skinTone
    }),
  {}
);

export default skinToneVariations;
