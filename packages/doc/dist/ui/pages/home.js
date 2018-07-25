'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Main Component
/******************************************************************************/

const Home = (_ref) => {
  let { children, location } = _ref,
      props = _objectWithoutProperties(_ref, ['children', 'location']);

  return _react2.default.createElement(
    _page2.default,
    null,
    _react2.default.createElement(
      'h2',
      null,
      location.pathname
    )
  );
};

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Home;