import { headerHeight } from '../../constants';

export default function headerTransform(distance) {

    return `transform: translateY(${distance-headerHeight}px);`;
}