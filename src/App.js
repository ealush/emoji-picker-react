import React, { Component } from 'react';
import { throttle, debounce } from 'throttle-debounce';
import emojiGroups from './emoji-data/emoji-groups';
import EmojiGroup from './EmojiGroup';
import Footer from './Footer';
import GroupsNav from './GroupsNav';
import SearchBar from './SearchBar';
import { headerHeight, getOffsets, clearTransform, getProximity, getScrollbarWidt, adjustScrollbar } from './helpers';
import './App.css';

const scrollThrottleDelay = 1,
    hideScrollDebounce = 550;

class App extends Component {

    constructor() {
        super();

        this.state = {
            filter: null,
            modifier: null,
            activeModifier: null
        };

        this.active = null; // this is for updating the category name
        this.transformed = [];

        this.throttleScroll = throttle(scrollThrottleDelay, this.throttleScroll.bind(this));
        this.onScroll = this.onScroll.bind(this);
        this.onGroupClick = this.onGroupClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onModifierChosen = this.onModifierChosen.bind(this);
        this.hideScrollbar = debounce(hideScrollDebounce, this.hideScrollbar.bind(this));
    }

    componentDidMount() {
        this.scrollbarWidth = getScrollbarWidt();
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
        this.listHeight = positions.listHeight;
        this._groups = this._list.children; // FIXME: Another abomination
        this.setActiveGroup({index: 0});
    }

    componentDidUpdate() {
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
    }

    setActiveGroup({_prevActive, list, index}) {

        const indexPresent = typeof index === 'number',
            classList = this.refs._picker.classList,
            prevActive = this.active;

        if (index === prevActive) {
            return;
        }

        if (!indexPresent) {
            index = 0;
        }

        emojiGroups.forEach((group) => {
            if (group.name !== emojiGroups[index].name && classList.contains(group.name)) {
                classList.remove(group.name);
            }
        });

        classList.add(emojiGroups[index].name);
        this.active = index;
    }

    throttleScroll(e) {
        const scrollTop = e.target.scrollTop,
            active = this.active,
            _active = this._groups[active];

        const {
                proximityIndex, // closest group index
                visibleGroup    // currently visible group
            } = getProximity(this.offsets, scrollTop);

        this._scroller.classList.add('shown');
        adjustScrollbar(this.scrollHeight, scrollTop, this.listHeight, this._scroller);

        // this block deals with mismatches that are caused by fast scrolling
        if (typeof proximityIndex !== 'number') {
            if (visibleGroup !== active) {
                this.setActiveGroup({ index: visibleGroup, list: true });
            }
            return this.transformed = clearTransform(this.transformed);
        }

        const distance =  -(scrollTop - this.offsets[proximityIndex]),
            _activeName = _active.querySelector('.group-name'), // active group name
            currentIsFirst = proximityIndex === 0, // is this the first group?
            currentIsActive = proximityIndex === active; // is the current group the active one

        if (distance <= 0 && !currentIsActive) {
            // scroll down
            this.setActiveGroup({ _prevActive: _active, index: proximityIndex});
        } else if (!currentIsFirst && distance >= 0 && currentIsActive) {
            // scroll up
            this.setActiveGroup({ _prevActive: _active, index: active -1 });
        }

        if (!currentIsActive) {
            this.transformed = clearTransform(this.transformed, active);
            // push the active title up or down
            _activeName.setAttribute('style', `transform: translateY(${distance-headerHeight}px);`);
            this.transformed.push({ index: active, element: _activeName });
        }
    }

    onScroll(e) {
        e.persist();
        this.throttleScroll(e);
        this.hideScrollbar();
    }

    hideScrollbar() {
        this._scroller.classList.remove('shown');
    }

    onGroupClick(e, index) {
        e && e.preventDefault();
        const _newActive = this._list.children[index];
        _newActive.scrollIntoView({'behavior': 'smooth'});
        this.setActiveGroup({_newActive});
    }

    onSearch(filter) {
        this.onGroupClick(null, 0); // FIXME!!! scroll back to the top
        this.setState({ filter });
    }

    onModifierChosen(e, modifier) {
        e.preventDefault();
        if (modifier === this.state.activeModifier) {
            modifier = null;
        }
        this.setState({ activeModifier: modifier })
    }

    render() {

        const { nav = 'top' } = this.props;
        const { filter, activeModifier } = this.state;
        const navClass = `nav-${nav}`;

        return (
            <div className="App">
                <aside className={`emoji-picker ${navClass}`} ref="_picker">
                    <GroupsNav onClick={this.onGroupClick}/>
                    <SearchBar onChange={this.onSearch}/>
                    <div className="wrapper">
                        <div className="scroller" ref={(scroller) => this._scroller = scroller}><div/></div>
                        <div className="emoji-list" ref={(list) => this._list = list} onScroll={this.onScroll}>
                            {emojiGroups.map((group, index) =>
                                <EmojiGroup group={group}
                                    index={index}
                                    key={index}
                                    filter={filter}
                                    activeModifier={activeModifier}/>
                            )}
                        </div>
                    </div>
                    <Footer onModifierChosen={this.onModifierChosen} activeModifier={activeModifier}/>
                </aside>
            </div>
        );
    }
}

export default App;
