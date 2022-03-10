import React from 'react';
import PropTypes, { any } from 'prop-types';
import { groupNamesPropType } from '../../lib/propTypes';
import { useConfig } from '../../PickerContext';
import './style.css';
import CreateEmojiList from './createEmojiList.jsx';

const ListRender = React.memo(function ListRender({
  name,
  emojiListRef,
  groupNames,
  customGroups,
}) {
  const { groupVisibility } = useConfig();

  if (groupVisibility[name] === false) {
    return null;
  }

  const { list, shown } = CreateEmojiList(name, { emojiListRef },customGroups);

  const style = { ...(!shown && { display: 'none' }) };

  return (
    <ul
      className="emoji-group"
      data-name={name}
      data-display-name={groupNames[name]}
      key={name}
      style={style}
    >
      {list}
    </ul>
  );
});

export default ListRender;

ListRender.propTypes = {
  name: PropTypes.string,
  searchTerm: PropTypes.string,
  emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  groupNames: groupNamesPropType,
  customGroups: any,
};
