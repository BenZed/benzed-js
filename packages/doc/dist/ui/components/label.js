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

const Label = _styledComponents2.default.label.withConfig({
  displayName: 'label__Label'
})(['font-weight:bold;']);

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = Label;