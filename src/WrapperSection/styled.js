import styled from 'react-emotion';
import {
    PADDING_CATEGORY_NAME,
    BG_IMG_FIND,
    BG_FOOTER,
    BG_SCROLLER,
    COLOR_SHORTNAME,
    HEIGHT_FOOTER
} from '../styled';

const Section = styled.section`
    position: relative;
    overflow: hidden;
    flex: 1;

    ${({noSearchResults}) => {
        if (!noSearchResults) { return; }

        return `
            &:before {
                content: '';
                background-repeat: no-repeat;
                background-image: url("${BG_IMG_FIND}");
                background-position: 50% 50%;
                background-size: 100px 100px;
                display: block;
                width: 100px;
                height: 100px;
                position: absolute;
                top: 50%;
                left: 50%;
                opacity: .07;
                transform: translateX(-50%) translateY(-50%);
            }

            .emoji-name {
                display: none;
            }
        `;
    }}

    &:after {
        content: '';
        background-color: ${BG_FOOTER};
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: ${HEIGHT_FOOTER};
    }
`;

const EmojiName = styled.span`
    position: absolute;
    right: ${PADDING_CATEGORY_NAME};
    top: 8px;
    font-size: 10px;
    font-weight: 100;
    z-index: 2;
    color: ${COLOR_SHORTNAME};
    max-width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Scroller = styled.div`
    display: block;
    position: absolute;
    width: 5px;
    padding-top: 5px;
    z-index: 2;
    right: 3px;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity .4s;

    &.shown {
        opacity: 1;
        transition: opacity .2s, transform .1s;
    }

    div {
        background-color: ${BG_SCROLLER};
        width: 100%;
        min-height: 12px;
        border-radius: 5px;
    }
`;

export {
    Section,
    EmojiName,
    Scroller
};