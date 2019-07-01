import React from 'react';
import styled from 'styled-components';
import  { groupedEmojis, groups } from '../../../lib/initEMojis';
import { TEXT_LIGHT } from '../../lib/colors';

console.log(groupedEmojis)
const CATEGORY_TITLE_BAR_HEIGHT = '45px';

const Ul = styled.ul`
    position: relative;
    padding: ${CATEGORY_TITLE_BAR_HEIGHT} 15px 0 15px;
    list-style: none;
    margin: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    &:before {
        content: attr(data-name);
        color: ${TEXT_LIGHT};
        position: absolute;
        top: 0;
        text-transform: uppercase;
        line-height: ${CATEGORY_TITLE_BAR_HEIGHT};
        font-weight: 500;
    }

    &:after {
        content: '';
        flex: 1000;
        order: 99999;
        flex-basis: 25px;
    }
`;

const Li = styled.li`

    button {
        height: 25px;
        width: 25px;
        border: none;
        background-size: 20px 20px;
        background-position: 50% 50%;
        background-repeat: no-repeat;
    }
`;

const Emoji = ({ emoji }) => {

    return (
        <Li style={{ order: emoji.sort_order }}>
            <button style={{backgroundImage: `url(https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/${emoji.unified}.png)` }}/>
        </Li>
    );
}

const ListsWrapper = styled.section`
    overflow-y: scroll;
    height: 100%;
    box-sizing: border-box;
`;

const EmojiList = () => {

    return (
        <ListsWrapper>
            {groups.map((group) => (
                <Ul data-name={group} key={group}>
                    {groupedEmojis[group].map((emoji) => (
                        <Emoji key={emoji.unified} emoji={emoji}/>
                    ))}
                </Ul>
            ))}
        </ListsWrapper>
    );
}

export default EmojiList;