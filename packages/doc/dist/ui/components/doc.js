'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _label = require('./label');

var _label2 = _interopRequireDefault(_label);

var _params = require('./params');

var _params2 = _interopRequireDefault(_params);

var _reactRouterDom = require('react-router-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Title = _styledComponents2.default.div.withConfig({
  displayName: 'doc__Title'
})(['display:flex;flex-direction:row;background-color:', ';color:', ';margin:0em -1em 0em -1em;padding:0.25em 0.25em 0.25em 1.25em;'], props => props.theme.primary.fade(0.5).toString(), props => props.theme.primary.darken(0.5).toString());

const Description = _styledComponents2.default.div.attrs({
  children: props => props.description.split('\n\n').map((paragraph, i) => _react2.default.createElement(
    'p',
    { key: i },
    paragraph
  ))
}).withConfig({
  displayName: 'doc__Description'
})(['padding:0.5em 0em 0.5em 0em;p{margin:0em 0em 0.25em 0em;}']);

const LinkLabel = _label2.default.withComponent(_reactRouterDom.Link);

/******************************************************************************/
// Main Component
/******************************************************************************/

const Doc = (0, _styledComponents2.default)((_ref) => {
  let { doc, match } = _ref,
      props = _objectWithoutProperties(_ref, ['doc', 'match']);

  const { name, description, params, returns } = doc;

  return _react2.default.createElement(
    'div',
    props,
    _react2.default.createElement(
      Title,
      null,
      _react2.default.createElement(
        LinkLabel,
        { to: `${match.url}/${name}` },
        name
      )
    ),
    _react2.default.createElement(Description, { description: description }),
    _react2.default.createElement(_params2.default, { params: params }),
    _react2.default.createElement(_params2.default, { params: returns, label: 'returns' })
  );
}).withConfig({
  displayName: 'doc__Doc'
})(['margin:1em;display:flex;', '{text-decoration:none;}'], LinkLabel);

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Doc;