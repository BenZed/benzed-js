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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Helper
/******************************************************************************/

const Type = (0, _styledComponents2.default)((_ref) => {
  let { type } = _ref,
      props = _objectWithoutProperties(_ref, ['type']);

  return _react2.default.createElement(
    'span',
    props,
    type.names.map(name => _react2.default.createElement(
      'code',
      { key: name },
      name
    ))
  );
}).withConfig({
  displayName: 'params__Type'
})(['code{color:', ';background-color:', ';border-radius:0.25em;padding:0.1em;&:not(:last-child){margin-right:0.25em;}}'], props => props.theme.type.toString(), props => props.theme.type.lighten(0.5).toString());

const Description = _styledComponents2.default.span.withConfig({
  displayName: 'params__Description'
})(['font-style:italic;']);

const Param = (0, _styledComponents2.default)((_ref2) => {
  let { param } = _ref2,
      props = _objectWithoutProperties(_ref2, ['param']);

  return _react2.default.createElement(
    'div',
    props,
    param.name ? _react2.default.createElement(
      _label2.default,
      null,
      param.name
    ) : null,
    _react2.default.createElement(Type, { type: param.type }),
    param.description ? _react2.default.createElement(
      Description,
      null,
      param.description
    ) : null
  );
}).withConfig({
  displayName: 'params__Param'
})(['display:flex;flex-direction:row;justify-content:flex-start;', '{flex:0.125 0.125 4em;}', '{flex:0.125 0 4em;}', '{margin-left:0.25em;flex:1 1 100%;}margin:0.5em 0em 0em 1em;'], _label2.default, Type, Description);

/******************************************************************************/
// Main Component
/******************************************************************************/

const Params = (0, _styledComponents2.default)((_ref3) => {
  let { params, label } = _ref3,
      props = _objectWithoutProperties(_ref3, ['params', 'label']);

  return _react2.default.createElement(
    'div',
    props,
    _react2.default.createElement(
      _label2.default,
      null,
      label
    ),
    params.map((param, i) => _react2.default.createElement(Param, { param: param, key: i }))
  );
}).withConfig({
  displayName: 'params__Params'
})(['margin-top:0.5em;font-size:0.8em;> ', '{display:inline-flex;background-color:', ';padding:0.25em;border-radius:0.25em;color:', ';}'], _label2.default, props => props.theme.primary.toString(), props => props.theme.primary.darken(0.4).toString());

Params.defaultProps = {
  label: 'params'

  /******************************************************************************/
  // Exports
  /******************************************************************************/

};exports.default = Params;