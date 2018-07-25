'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
//
/******************************************************************************/

const MissingPage = _page2.default.extend`
  justify-content: center;
`;

/******************************************************************************/
// Helper
/******************************************************************************/

const Band = _styledComponents2.default.div.withConfig({
  displayName: 'missing__Band'
})(['display:flex;flex:0 1 8em;justify-content:center;background-color:', ';color:', ';h2{font-size:2.5em;margin-left:1em;}margin:-1em;'], props => props.theme.primary.toString(), props => props.theme.primary.darken(0.5).toString());

/******************************************************************************/
// Main Component
/******************************************************************************/

const Missing = ({ location }) => _react2.default.createElement(
  MissingPage,
  null,
  _react2.default.createElement(
    Band,
    null,
    _react2.default.createElement(
      'h2',
      null,
      location.pathname,
      ' is not a valid path'
    )
  )
);

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Missing;