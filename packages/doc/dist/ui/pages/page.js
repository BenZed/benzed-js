'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Main Components
/******************************************************************************/

const Page = _styledComponents2.default.div.withConfig({
  displayName: 'page__Page'
})(['display:flex;flex:1 1 auto;']);

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Page;