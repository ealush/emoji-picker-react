import globalObject from '../globalObject';

const RECENTLY_USED_KEY = 'epr_ru';

const LOCAL_STORAGE_PRESENT = 'localStorage' in globalObject;

const getRecentlyUsed = () => {
    if (!LOCAL_STORAGE_PRESENT) {
        return [];
    }

    const ruList = localStorage.getItem(RECENTLY_USED_KEY);

    return !ruList
        ? []
        : JSON.parse(ruList);
};

export const setRecentlyUsed = (item) => {

    if (!LOCAL_STORAGE_PRESENT) {
        return;
    }

    const ruList = [item, ...getRecentlyUsed().filter((value) => (
        value !== item
    ))];

    const output = ruList.splice(0, 14);

    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(output));
};

const recentlyUsed = getRecentlyUsed();

export default recentlyUsed;
