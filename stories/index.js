import React from 'react'; // eslint-disable-line no-unused-vars
import { storiesOf } from '@kadira/storybook';
import Picker from '../src';

// eslint-disable-next-line no-undef
const assetPath = `${process.env.PUBLIC_URL}`;

// eslint-disable-next-line no-undef
storiesOf('Picker', module)
    .add('Top Navigation +(32x32)', () => (
        <Picker assetPath={`${assetPath}/32x32`}/>
    ))
    .add('Left Navigation +(64x64)', () => (
        <Picker assetPath={`${assetPath}/64x64`} nav="left"/>
    ))
    .add('Bottom Navigation +(128x128)', () => (
        <Picker assetPath={`${assetPath}/128x128`} nav="bottom"/>
    ));