import { SkinTones } from '../types/exposedTypes';

const skinToneVariations = [
  SkinTones.NEUTRAL,
  SkinTones.LIGHT,
  SkinTones.MEDIUM_LIGHT,
  SkinTones.MEDIUM,
  SkinTones.MEDIUM_DARK,
  SkinTones.DARK
];

export const skinTonesNamed = Object.entries(SkinTones).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);

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
