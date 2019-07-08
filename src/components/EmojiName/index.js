import styled from 'styled-components';
import { GLOBAL_PADDING } from '../../styled';
import { TEXT_DARK } from '../../lib/colors';

const EmojiName = styled.span`
    color: ${TEXT_DARK};
    font-size: 9px;
    height: 10px;
    position: sticky;
    top: 0;
    right: ${GLOBAL_PADDING}px;
    z-index: 100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 125px;
    float: right;
    transform: translate(0, 25px);
`;

export default EmojiName;
