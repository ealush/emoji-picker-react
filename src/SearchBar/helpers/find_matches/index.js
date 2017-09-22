import { ALL_KEYWORDS, KEYWORDS_SINGLE} from '../../../constants';

export default function findMatches(text) {
    if (KEYWORDS_SINGLE.hasOwnProperty(text)) {
        return KEYWORDS_SINGLE[text];
    }

    return ALL_KEYWORDS.filter((keyword) => keyword.indexOf(text) > -1);
}