export default function unifiedWithModifier(emoji, activeModifier) {
    if (activeModifier && emoji.hasOwnProperty('diversities')) {
        const currentDiversity = `${emoji.unified}-${activeModifier}`;
        if (emoji.diversities.indexOf(currentDiversity) > -1) {
            return currentDiversity;
        }
    }

    return emoji.unified;
}