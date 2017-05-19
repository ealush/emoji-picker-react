import React from 'react';
import emojiGroups from '../emoji-data/emoji-groups';
import './style.css';

function GroupsNav({onClick}) {

    return (
        <nav>{
                emojiGroups.map((group, index) => {
                    return (<a href="#!" className={group.name} key={index} onClick={(e) => onClick(e, index)}>
                        <span className="hidden">{group.name}</span>
                    </a>)
                })
            }
        </nav>
    );
}

export default GroupsNav;