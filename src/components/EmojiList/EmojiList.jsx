import PropTypes, { any } from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import groups from '../../groups.json';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import useScrollUpOnFilterChange from '../../hooks/useScrollUpOnFilterChange';

import {
  useActiveCategory,
  useConfig,
  useFilterResult,
  useFilterValue,
} from '../../PickerContext';

import './style.css';

import ListRender from './listRender.jsx';

const EmojiList = ({ emojiListRef, customGroups }) => {
  const activeCategory = useActiveCategory();
  const { groupNames } = useConfig();
  const filterResult = useFilterResult();
  const filter = useFilterValue();
  const activeCategoryRef = useRef(activeCategory);
  const filterResultRef = useRef(filterResult);

  const [renderOne, setRenderOne] = useState(true);
  const [groupNamesWithCustomGroups, setGroupNamesWithCustomGroups] = useState(
    {}
  );

  const searchTerm = filter?.length ? filter[filter.length - 1].value : '';

  const [groupsWithCustomGroups, setGroupsWithCustomGroups] = useState([
    ...groups,
  ]);

  useEffect(() => {
    if (!customGroups) {
      setGroupNamesWithCustomGroups(groupNames);
      return;
    }

    const customGroupsNames = customGroups.map(group => group.name);
    var obj = customGroupsNames.reduce((o, val) => ({ ...o, [val]: val }), {});
    const x = { ...groupNames, ...obj };
    setGroupNamesWithCustomGroups(x);
  }, [customGroups, groupNames]);

  useEffect(() => {
    if (!customGroups) {
      setGroupsWithCustomGroups(groups);
      return;
    }

    const customGroupsNames = customGroups.map(group => group.name);
    const x = [...groupsWithCustomGroups, ...customGroupsNames];
    setGroupsWithCustomGroups(x);
  }, [customGroups, groups]);

  useEffect(() => {
    if (!searchTerm) {
      requestAnimationFrame(() => {
        setRenderOne(true);
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (renderOne) {
      requestAnimationFrame(() => {
        setRenderOne(false);
      });
    }
  }, [renderOne]);

  useIntersectionObserver(
    emojiListRef,
    activeCategoryRef,
    filterResultRef,
    renderOne
  );
  useScrollUpOnFilterChange(filterResult, emojiListRef);

  const props = {
    emojiListRef,
    searchTerm,
    groupNames: groupNamesWithCustomGroups,
  };

  return (
    <>
      <ListRender name={groupsWithCustomGroups[0]} {...props} />
      {!renderOne &&
        groupsWithCustomGroups
          .slice(1)
          .map(name => <ListRender key={name} name={name} {...props} customGroups={customGroups}/>)}
    </>
  );
};

export default EmojiList;

EmojiList.propTypes = {
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  unsetEmojiName: PropTypes.func,
  customGroups: any,
};
