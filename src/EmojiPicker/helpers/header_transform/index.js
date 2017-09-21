import { HEADER_HEIGHT } from '../../../constants';

export default function headerTransform(distance = 0) {
    distance = parseInt(distance, 10) || 0;
    return `transform: translateY(${distance-HEADER_HEIGHT}px);`;
}