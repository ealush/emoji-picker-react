import { Header_Height } from '../../../constants';

export default function headerTransform(distance) {

    return `transform: translateY(${distance-Header_Height}px);`;
}