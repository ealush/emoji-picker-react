export default function headerTransform(distance = 0, headerHeight = 30) {
    distance = parseInt(distance, 10) || 0;
    return `transform: translateY(${distance-headerHeight}px);`;
}