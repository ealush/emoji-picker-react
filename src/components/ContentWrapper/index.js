import styled from 'styled-components';
import { GLOBAL_PADDING, TITLE_LINE_HEIGHT } from '../../styled';
import { TEXT_LIGHT } from '../../lib/colors';

const EmojiName = styled.div`
    overflow: hidden;
    position: relative;

    &:before {
        content: attr(data-name);
        color: ${TEXT_LIGHT};
        font-size: 11px;
        display: block;
        position: absolute;
        right: ${GLOBAL_PADDING}px;
        z-index: 10;
        line-height: ${TITLE_LINE_HEIGHT}px;
        max-height: ${TITLE_LINE_HEIGHT}px;
        overflow: hidden;
        max-width: 100px;
        text-overflow: ellipsis;
        text-align: right;
    }
`;

export default EmojiName;
