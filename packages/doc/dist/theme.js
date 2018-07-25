'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('@benzed/react');

/******************************************************************************/
// Theme
/******************************************************************************/

const theme = _extends({}, _react.themes.basic, {

  fg: new _react.Color('#160701'),
  bg: new _react.Color('#f7f9f8'),
  primary: new _react.Color('orange'),
  type: new _react.Color('#3c65a8')

  /******************************************************************************/
  // Exports
  /******************************************************************************/

});exports.default = theme;