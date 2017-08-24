import { HEADER_HEIGHT } from '../../../constants';

export default function headerTransform(distance) {

    return `transform: translateY(${distance-HEADER_HEIGHT}px);`;
}