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

var _missing = require('./missing');

var _missing2 = _interopRequireDefault(_missing);

var _components = require('../components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Helper
/******************************************************************************/

function groupDocsBy(key, name) {

  const pkg = this;

  const groups = {};

  for (const doc of pkg.doc) {
    if (name && doc.name !== name) continue;

    const value = doc[key] || '';
    groups[value] = groups[value] || { [key]: value, doc: [] };
    groups[value].doc.push(doc);
  }

  return Object.values(groups);
}

/******************************************************************************/
// Styled Components
/******************************************************************************/

const Header = _styledComponents2.default.div.withConfig({
  displayName: 'package__Header'
})(['text-transform:capitalize;background-color:', ';color:', ';padding:1em;h3{margin-top:0.5em;}'], props => props.theme.primary.fade(0.5).toString(), props => props.theme.primary.darken(0.5).toString());

const Group = _styledComponents2.default.h2.withConfig({
  displayName: 'package__Group'
})(['text-transform:capitalize;margin:0.5em;color:', ';'], props => props.theme.primary.darken(0.5).toString());

/******************************************************************************/
// Main Component
/******************************************************************************/

const Package = (_ref) => {
  let { children, pkg, match, location } = _ref,
      props = _objectWithoutProperties(_ref, ['children', 'pkg', 'match', 'location']);

  const { docName } = match.params;

  const isSingleDoc = !!docName;
  const groups = groupDocsBy.call(pkg, 'kind', docName);

  return groups.length > 0 ? _react2.default.createElement(
    _page2.default,
    null,
    _react2.default.createElement(
      Header,
      null,
      _react2.default.createElement(
        'h1',
        null,
        pkg.name
      ),
      _react2.default.createElement(
        'h3',
        null,
        pkg.description
      )
    ),
    groups.map(({ kind, doc }) => [isSingleDoc ? null : _react2.default.createElement(
      Group,
      { key: 'title' },
      kind,
      's'
    ), ...doc.map(doc => _react2.default.createElement(_components.Doc, { key: doc.name, doc: doc, match: match }))])
  ) : _react2.default.createElement(_missing2.default, { location: location });
};

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Package;