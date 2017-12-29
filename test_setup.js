const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

require('babel-register')();

const React = require('react'),
    chai = require('chai');

global.React = React;
global.expect = chai.expect;