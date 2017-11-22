import React from 'react';
import Skintones from './';
import { shallow } from 'enzyme';
import { modifiers } from '../emoji-data';

const wrapper = shallow(<Skintones spread={true}/>);

describe('Test Skintones', () => {
    it('Shoud have modifiter spread class', () => {
        expect(wrapper.find('.spread')).to.have.lengthOf(1);
    });

    it('Should render correct amount of modifiters', () => {
        expect(wrapper.find('.skin-tones li')).to.have.lengthOf(modifiers.length);
    });
});