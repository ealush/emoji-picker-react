export default function memberWithModifier(emoji, member, activeModifier) {
    if (activeModifier && emoji.hasOwnProperty('diversities')) {
        const currentDiversity = `${member}-${activeModifier}`;
        if (emoji.diversities.indexOf(currentDiversity) > -1) {
            return currentDiversity;
        }
    }

    return member;
}