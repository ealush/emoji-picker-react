import React, {Component} from 'react';
import emojis from '../emoji-data/emoji-list';
import Emoji from '../Emoji';
import './style.css';

class EmojiGroup extends Component {

    render() {
        const {
            index,
            group,
            filter,
            activeModifier
        } = this.props;

        const hiddenClass = filter && !filter.hasOwnProperty(group.name) ? ' hidden' : '';

        return (
            <ul className={`emoji-group ${group.name}${hiddenClass}`} key={index}>
                <li className="group-name">#{group.name}</li>
                {group.members.map((member, index) => {

                    const emoji = emojis[member],
                        hidden = filter && !(filter.hasOwnProperty(group.name) && filter[group.name].hasOwnProperty(member));
                    return (
                        <Emoji member={member} emoji={emoji} key={index} hidden={hidden} activeModifier={activeModifier}/>
                    )
                })}
            </ul>
        );
    }
}

export default EmojiGroup;