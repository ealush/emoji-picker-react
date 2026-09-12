import { EmojiProperties } from '../dataUtils/DataTypes';

export type CustomEmoji = {
  names: string[];
  [EmojiProperties.imgUrl]: string;
  id: string;
  /**
   * Optional group name. Customs sharing a group render as their own
   * category section; ungrouped customs keep the single shared bucket.
   * Reference the group from a `{ category: Categories.CUSTOM, group }`
   * entry in the `categories` prop to place and name the section.
   * https://github.com/ealush/emoji-picker-react/issues/510
   */
  group?: string;
};
