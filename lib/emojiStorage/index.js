import groupedEmojis from '../../src/emojis.json';
import { EMOJI_PROPERTY_GROUP, EMOJI_PROPERTY_UNIFIED } from '../constants';

const initEmojis = (groupedEmojis) => {

    const storage = {
        groups: {},
        emojis: {}
    };

    for (const group in groupedEmojis) {
        groupedEmojis[group].reduce((storage, current) => {
            const unified = current[EMOJI_PROPERTY_UNIFIED];
            current[EMOJI_PROPERTY_GROUP] = group;
            storage.emojis[unified] = current;
            storage.groups[group] = storage.groups[group] || [];
            storage.groups[group].push(unified);
            return storage;
        }, storage);
    }

    return storage;
};

export default initEmojis(groupedEmojis);
