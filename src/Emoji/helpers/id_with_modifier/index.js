export default function idWithModifier(emoji, activeModifier) {
    if (activeModifier && emoji.hasOwnProperty('diversities')) {
        const currentDiversity = `${emoji.id}-${activeModifier}`;
        if (emoji.diversities.indexOf(currentDiversity) > -1) {
            return currentDiversity;
        }
    }

    return emoji.id;
}