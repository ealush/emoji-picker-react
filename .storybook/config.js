const React = require('react');
import { configure } from '@storybook/react';
import '@storybook/addon-actions/register';

function loadStories() {
    require('../stories');
}

configure(loadStories, module);