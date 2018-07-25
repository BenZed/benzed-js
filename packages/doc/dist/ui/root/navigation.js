'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _reactRouterDom = require('react-router-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Helper Components
/******************************************************************************/

const Nav = _styledComponents2.default.nav.withConfig({
  displayName: 'navigation__Nav'
})(['display:flex;flex-wrap:wrap;flex-direction:row;padding:0.5em;text-transform:uppercase;background-color:', ';color:', ';a{text-decoration:none;font-size:0.825em;flex:0 0.5 auto;margin:auto 1em auto 0em;padding:0.1em;border-bottom:2px solid transparent;transition:color 250ms,background-color 250ms,border-color 250ms;}a:hover:not(.active){color:', ';}a.active{border-color:', '}'], props => props.theme.primary.toString(), props => props.theme.primary.darken(0.5).toString(), props => props.theme.primary.darken(0.25).toString(), props => props.theme.primary.darken(0.5).toString());
//
// const SearchInput = styled.input`
//   margin-left: auto;
//   padding: 0;
//   border-width: 2px;
//   ::placeholder {
//     font-style: italic;
//   }
// `

/******************************************************************************/
// Main
/******************************************************************************/

const Navigation = ({ packages }) => {

  return _react2.default.createElement(
    Nav,
    null,
    packages.map(pkg => _react2.default.createElement(
      _reactRouterDom.NavLink,
      {
        key: pkg.name,
        to: `/${pkg.name}`,
        activeClassName: 'active' },
      pkg.name
    ))
  );
};

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Navigation;