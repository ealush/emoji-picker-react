import React, { Component } from 'react';
import EmojiGroups from './EmojiGroups';
import Emojis from './EmojiList';
import './App.css';

const headerHeight = 25,
    scrollThrottle = 3,
    ACTIVE = 'active';

function bgImage(name) {
    return {
        'backgroundImage': `url(/png/${name}.png)`
    };
}

function calculateOffsets(list) {
    const offsets = [];
    Array.prototype.forEach.call(list.children, (node, index) => {
        offsets.push(node.offsetTop);
    });

    return offsets;
}

function SingleEmoji({member, emoji}) {

    if (emoji.hasOwnProperty('diversity')) {
        return null;
    }

    const style = {
        order: emoji.order
    };

    return (<li className="emoji" style={style}>
                <a href="#!" style={bgImage(member)}><span>{emoji.shortname}</span></a>
            </li>);
}

function clearTransform(transformed, keep) {

    if (!transformed) {
        return;
    }

    const newList = [];

    transformed.forEach((groupName) => {
        if (groupName.index === keep) {
            newList.push(groupName);
            return;
        }

        groupName.element.removeAttribute('style');
    });

    return newList;
}

function getProximity(offsets, scrollTop) {

    let proximityIndex = null,
        visibleGroup;
    for (let index = 0; index < offsets.length; index++) {
        const offset = offsets[index],
            elementIsDown = scrollTop + headerHeight >= offset,
            elementIsUp = scrollTop - headerHeight <= offset,
            inProximity = elementIsDown && elementIsUp;

        if (offset <= scrollTop && offsets[index + 1] >= scrollTop) {
            visibleGroup = index;
        } else if (index === offsets.length) {
            visibleGroup = index;
        }

        if (inProximity) {
            proximityIndex = index;
            break;
        }
    }

    return {
        proximityIndex,
        visibleGroup
    };
}

class App extends Component {

    constructor() {
        super();

        this.active = 0; // this is for updating the category name
        this.transformed = [];

        this.onScroll = this.onScroll.bind(this);
    }

    setActiveGroup({_prevActive, list, index}) {

        const indexPresent = typeof index === 'number',
            _list = this._list,
            prevActive = this.active;

        let _newActive;

        if (indexPresent) {
            _newActive = _list.children[index];
        }

        if (!_newActive) {
            return;
        }

        if (list || !_prevActive) {
            const _allActive = _list.querySelectorAll('.active');
            for (let index = 0; index < _allActive.length; index++) {
                _allActive[index].classList.remove(ACTIVE);
            }
        } else {
            _prevActive.classList.remove(ACTIVE);
        }

        this[`_nav_${prevActive}`].classList.remove(ACTIVE);
        this[`_nav_${index}`].classList.add(ACTIVE);
        _newActive.classList.add(ACTIVE);
        if (indexPresent) {
            this.active = index;
        } else {
            index = this.active;
        }

        return _newActive;
    }

    onScroll(e) {
        const now = Date.now();

        if (this.scrollThrottle && this.scrollThrottle > now) {
            return;
        }

        this.scrollThrottle = scrollThrottle + now;

        e.persist();

        const scrollTop = e.target.scrollTop,
            active = this.active,
            _active = this[`group_${active}`];

        setTimeout(() => {
            const {
                    proximityIndex,
                    visibleGroup
                } = getProximity(this.offsets, scrollTop);

            // this block deals with mismatches that are caused by fast scrolling
            if (typeof proximityIndex !== 'number') {
                if (visibleGroup !== active) {
                    this.setActiveGroup({ index: visibleGroup, list: true });
                }
                return this.transformed = clearTransform(this.transformed);
            }

            const distance =  -(scrollTop - this.offsets[proximityIndex]),
                _activeName = _active.querySelector('.group-name'),
                currentIsFirst = proximityIndex === 0,
                currentIsActive = proximityIndex === active;

            if (distance <= 0 && !currentIsActive) {
                // scroll down
                this.setActiveGroup({ _prevActive: _active, index: proximityIndex});
            } else if (!currentIsFirst && distance >= 0 && currentIsActive) {
                // scroll up
                this.setActiveGroup({ _prevActive: _active, index: active -1 });
            }

            if (!currentIsActive) {
                this.transformed = clearTransform(this.transformed, active);

                _activeName.setAttribute('style', `transform: translateY(${distance-headerHeight}px);`);
                this.transformed.push({ index: active, element: _activeName });
            }
        }, scrollThrottle);

    }

    componentDidMount() {
        this.offsets = calculateOffsets(this._list);
    }

    onGroupClick(e, index) {
        e.preventDefault();
        const _newActive = this._list.children[index];
        _newActive.scrollIntoView({'behavior': 'smooth'});
        this.setActiveGroup({_newActive});
    }

    render() {

        const {
            nav = 'left'
        } = this.props;

        const active = this.active;

        return (
            <div className="App">

                <aside className="emoji-picker">
                    <nav className={nav}>{
                            EmojiGroups.map((group, index) => {
                                const groupClass = `${group.name}${active === index ? ' active' : ''}`
                                return <a href="#!" className={groupClass} key={index} ref={(_nav) => this[`_nav_${index}`] = _nav} onClick={(e) => this.onGroupClick(e, index)}></a>
                            })
                        }
                    </nav>
                    <div className="wrapper">
                        <div className="emoji-list" ref={(list) => this._list = list} onScroll={this.onScroll}>
                            {EmojiGroups.map((group, index) => {
                                const activeClass = active === index ? ' active' : '';
                                return (
                                    <ul className={`emoji-group${activeClass}`} key={`group-${index}`} ref={(group) => this[`group_${index}`] = group}>
                                        <li className="group-name">#{group.name}</li>
                                        {group.members.map((member, index) => {
                                            const emoji = Emojis[member];
                                            return (<SingleEmoji member={member} emoji={emoji} key={`emoji-${index}`}/>)
                                        })}
                                    </ul>
                                )
                            })}
                        </div>
                    </div>
                    <footer></footer>
                </aside>
            </div>
        );
    }
}

export default App;
