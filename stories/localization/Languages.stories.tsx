import React from 'react';
import { Meta } from '@storybook/react';

import EmojiPicker from '../../src';
import bn from '../../dist/data/emojis-bn';
import da from '../../dist/data/emojis-da';
import de from '../../dist/data/emojis-de';
import en from '../../dist/data/emojis-en';
import enGB from '../../dist/data/emojis-en-gb';
import es from '../../dist/data/emojis-es';
import esMX from '../../dist/data/emojis-es-mx';
import et from '../../dist/data/emojis-et';
import fi from '../../dist/data/emojis-fi';
import fr from '../../dist/data/emojis-fr';
import hi from '../../dist/data/emojis-hi';
import hu from '../../dist/data/emojis-hu';
import it from '../../dist/data/emojis-it';
import ja from '../../dist/data/emojis-ja';
import ko from '../../dist/data/emojis-ko';
import lt from '../../dist/data/emojis-lt';
import ms from '../../dist/data/emojis-ms';
import nb from '../../dist/data/emojis-nb';
import nl from '../../dist/data/emojis-nl';
import pl from '../../dist/data/emojis-pl';
import pt from '../../dist/data/emojis-pt';
import ru from '../../dist/data/emojis-ru';
import sv from '../../dist/data/emojis-sv';
import th from '../../dist/data/emojis-th';
import uk from '../../dist/data/emojis-uk';
import zh from '../../dist/data/emojis-zh';
import zhHant from '../../dist/data/emojis-zh-hant';

const meta: Meta<typeof EmojiPicker> = {
  title: 'Localization/Languages',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true,
  },
};

export default meta;

export const Bengali = () => <EmojiPicker emojiData={bn} />;
export const Danish = () => <EmojiPicker emojiData={da} />;
export const German = () => <EmojiPicker emojiData={de} />;
export const EnglishGB = () => <EmojiPicker emojiData={enGB} />;
export const English = () => <EmojiPicker emojiData={en} />;
export const SpanishMX = () => <EmojiPicker emojiData={esMX} />;
export const Spanish = () => <EmojiPicker emojiData={es} />;
export const Estonian = () => <EmojiPicker emojiData={et} />;
export const Finnish = () => <EmojiPicker emojiData={fi} />;
export const French = () => <EmojiPicker emojiData={fr} />;
export const Hindi = () => <EmojiPicker emojiData={hi} />;
export const Hungarian = () => <EmojiPicker emojiData={hu} />;
export const Italian = () => <EmojiPicker emojiData={it} />;
export const Japanese = () => <EmojiPicker emojiData={ja} />;
export const Korean = () => <EmojiPicker emojiData={ko} />;
export const Lithuanian = () => <EmojiPicker emojiData={lt} />;
export const Malay = () => <EmojiPicker emojiData={ms} />;
export const Norwegian = () => <EmojiPicker emojiData={nb} />;
export const Dutch = () => <EmojiPicker emojiData={nl} />;
export const Polish = () => <EmojiPicker emojiData={pl} />;
export const Portuguese = () => <EmojiPicker emojiData={pt} />;
export const Russian = () => <EmojiPicker emojiData={ru} />;
export const Swedish = () => <EmojiPicker emojiData={sv} />;
export const Thai = () => <EmojiPicker emojiData={th} />;
export const Ukrainian = () => <EmojiPicker emojiData={uk} />;
export const ChineseTraditional = () => <EmojiPicker emojiData={zhHant} />;
export const Chinese = () => <EmojiPicker emojiData={zh} />;
