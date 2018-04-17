'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promiseQueue = require('./promise-queue');

var _promiseQueue2 = _interopRequireDefault(_promiseQueue);

var _isExplicit = require('is-explicit');

var _isExplicit2 = _interopRequireDefault(_isExplicit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Helper
/******************************************************************************/

class SortablePromiseQueueItem extends _promiseQueue2.default.Item {

  constructor(promiser, order) {
    super(promiser);

    const isFunc = (0, _isExplicit2.default)(order, Function);
    if (!isFunc && !(0, _isExplicit2.default)(order, Number)) throw new Error('either a number or function that returns a number must be provided for an item\'s order value');

    this.order = isFunc ? order : () => order;
  }

}

function descending(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

/******************************************************************************/
// Main
/******************************************************************************/

class SortablePromiseQueue extends _promiseQueue2.default {

  constructor(maxConcurrent, sorter = descending) {
    super(maxConcurrent);

    if ((0, _isExplicit2.default)(sorter) && !(0, _isExplicit2.default)(sorter, Function)) throw new Error('sorter, if defined, must be a function');

    this.sorter = sorter;
  }

  onNext(queue) {
    queue.sort((a, b) => {

      const aOrder = (0, _isExplicit2.default)(a.order, Function) ? a.order() : a.order;
      const bOrder = (0, _isExplicit2.default)(b.order, Function) ? b.order() : b.order;

      return this.sorter(aOrder, bOrder);
    });
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

SortablePromiseQueue.Item = SortablePromiseQueueItem;
exports.default = SortablePromiseQueue;