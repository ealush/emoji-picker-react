export default function hitAnotherCategory({ distance, currentIsActive, currentIsFirst }) {

    if (Object.is(distance, 0) || (distance < 0 && !currentIsActive)) {
        return 'next';
    } else if (!currentIsFirst && distance >= 0 && currentIsActive) {
        return 'prev';
    }
}