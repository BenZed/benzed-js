'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _pages = require('../pages');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Main Component
/******************************************************************************/

const Routes = (_ref) => {
  let { children, packages } = _ref,
      props = _objectWithoutProperties(_ref, ['children', 'packages']);

  return _react2.default.createElement(
    _reactRouter.Switch,
    null,
    _react2.default.createElement(_reactRouter.Route, { path: '/', exact: true, component: _pages.Home }),
    packages.map(pkg => _react2.default.createElement(_reactRouter.Route, {
      key: pkg.name,
      path: `/${pkg.name}/:docName?`,
      render: route => _react2.default.createElement(_pages.Package, _extends({ pkg: pkg }, route))
    })),
    _react2.default.createElement(_reactRouter.Route, { component: _pages.Missing })
  );
};

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Routes;