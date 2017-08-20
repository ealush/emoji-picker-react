require('babel-register')();

const React = require('react'),
    chai = require('chai');

global.React = React;
global.expect = chai.expect;