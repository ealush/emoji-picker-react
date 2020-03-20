import React, { useState } from 'react';

import { storiesOf } from '@storybook/react';
import EmojiPicker from '../src';

storiesOf('EmojiPicker', module).add('EmojiPicker', () => {

    const [isShown, setIsShown] = useState(true);

    return (
        <div>
            <button onClick={()=>setIsShown(!isShown)}>Toggle</button>
            {isShown && <EmojiPicker
                onEmojiClick={(e, em) => console.log(em)}
                emojiUrl="https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64"/>
            }
        </div>
    )
});
