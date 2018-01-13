import { keywords } from '../emoji-data';
import keywordsSingleChar from '../SearchBar/helpers/init_keywords_single';
import * as scss from '../base.scss';

// view
export const HEADER_HEIGHT = parseInt(scss.height_category_name, 10);
export const PICKER_WIDTH = parseInt(scss.width_picker, 10);
export const PICKER_HEIGHT = parseInt(scss.height_picker, 10);
export const EMOJI_BG_SIZE = parseInt(scss.size_emoji, 10);
export const EMOJI_PADDING = parseInt(scss.padding_emoji, 10);
export const LIST_PADDING = parseInt(scss.padding_emoji_list, 10);
export const MIN_SCROLLBAR_HEIGHT_PADDED = 15;

// timers
export const OPEN_DIVERSITIES_TIMEOUT = 1000;
export const HIDE_SCROLL_DEBOUNCE = 550;
export const FILTER_UPDATE_DEBOUNCE = 200;

// images
export const DEFAULT_CDN_PATH = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png';
export const DEFAULT_IMAGE_RESOLUTION = '32';

// keywords
export const ALL_KEYWORDS = Object.keys(keywords);
export const KEYWORDS_SINGLE = keywordsSingleChar;