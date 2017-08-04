import { keywords } from '../../../emoji-data';

const keywordsSingleChar = {};

for (const keyword in keywords) {
    for (let i = 0; i < keyword.length; i++) {
        keywordsSingleChar[keyword[i]] = keywordsSingleChar[keyword[i]] || [];
        if (keywordsSingleChar[keyword[i]].indexOf(keyword) === -1) {
            keywordsSingleChar[keyword[i]].push(keyword);
        }
    }
}

export default keywordsSingleChar;