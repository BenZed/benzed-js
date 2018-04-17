'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SortablePromiseQueue = exports.PromiseQueue = undefined;

var _promiseQueue = require('./promise-queue');

var _promiseQueue2 = _interopRequireDefault(_promiseQueue);

var _sortablePromiseQueue = require('./sortable-promise-queue');

var _sortablePromiseQueue2 = _interopRequireDefault(_sortablePromiseQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Extend
/******************************************************************************/

_promiseQueue2.default.Sortable = _sortablePromiseQueue2.default;

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = _promiseQueue2.default;
exports.PromiseQueue = _promiseQueue2.default;
exports.SortablePromiseQueue = _sortablePromiseQueue2.default;