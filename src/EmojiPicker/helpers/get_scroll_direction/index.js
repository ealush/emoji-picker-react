export default function getScrollDirection({ distance, currentIsActive, currentIsFirst }) {
    if (distance === 0 || (distance < 0 && !currentIsActive)) {
        return 'down';
    } else if (!currentIsFirst && distance >= 0 && currentIsActive) {
        return 'up';
    }
}