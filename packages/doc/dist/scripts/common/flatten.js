'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isExplicit = require('is-explicit');

var _isExplicit2 = _interopRequireDefault(_isExplicit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Main
/******************************************************************************/

function flatten(input) {
  return input.reduce((output, item) => {
    if (_isExplicit2.default.array(item)) output.push(...flatten(item));else output.push(item);

    return output;
  }, []);
}
/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = flatten;