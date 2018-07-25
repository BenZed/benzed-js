'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@benzed/react');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _navigation = require('./navigation');

var _navigation2 = _interopRequireDefault(_navigation);

var _theme = require('../../theme');

var _theme2 = _interopRequireDefault(_theme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Main
/******************************************************************************/

const Website = (_ref) => {
  let { children, packages } = _ref,
      props = _objectWithoutProperties(_ref, ['children', 'packages']);

  return _react2.default.createElement(
    _react3.GlobalStyle,
    { theme: _theme2.default },
    _react2.default.createElement(_navigation2.default, { packages: packages }),
    _react2.default.createElement(
      _react3.Scroll,
      { y: true },
      _react2.default.createElement(_routes2.default, { packages: packages })
    )
  );
};

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Website;