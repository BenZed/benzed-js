'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/******************************************************************************/
// What's this?
/******************************************************************************/

// As the title suggests, this class allows you to run promises sequentially,
// which is important for something like After Effects, because it can only
// handle one script at a time.

/******************************************************************************/
// Symbolic Property Keys
/******************************************************************************/

const QUEUE = Symbol('queue');
const CURRENT = Symbol('current');
const MAX_CONCURRENT = Symbol('max-concurrent');

const NEXT = Symbol('next');
const DONE = Symbol('done');

/******************************************************************************/
// Private Danglers
/******************************************************************************/

function next() {

  if (this.resolvingCount >= this.maxConcurrent) return;

  const queue = this[QUEUE];
  const current = this[CURRENT];
  const done = this[DONE];

  this.onNext(queue);

  const item = queue.shift();

  item.run(done);

  current.push(item);
}

function done(item) {

  const queue = this[QUEUE];
  const current = this[CURRENT];
  const next = this[NEXT];

  const index = current.indexOf(item);

  current.splice(index, 1);

  this.onDone(queue);

  if (queue.length > 0) next();
}

/******************************************************************************/
// PromiseQueueItem
/******************************************************************************/

class PromiseQueueItem {

  constructor(promiser) {
    this.promiser = promiser;
    this.complete = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  run(done) {
    var _this = this;

    return _asyncToGenerator(function* () {

      try {
        const results = yield _this.promiser();
        _this.resolve(results);
      } catch (err) {
        _this.reject(err);
      }

      done(_this);
    })();
  }

}

/******************************************************************************/
// PromiseQueue export
/******************************************************************************/

class PromiseQueue {

  constructor(maxConcurrent = 1) {
    this[CURRENT] = [];
    this[QUEUE] = [];
    this[NEXT] = next.bind(this);
    this[DONE] = done.bind(this);
    this[MAX_CONCURRENT] = null;


    if (typeof maxConcurrent !== 'number' || !isFinite(maxConcurrent) || maxConcurrent < 1) throw new Error('maxConcurrent, if defined, must be a number above zero.');

    this[MAX_CONCURRENT] = maxConcurrent;
  }

  add(promiser, ...args) {

    if (typeof promiser !== 'function') throw new Error('PromiseQueue.add() takes a function that returns a promise.');

    const { Item } = this.constructor;

    const item = new Item(promiser, ...args);

    this[QUEUE].push(item);
    this[NEXT]();

    return item.complete;
  }

  clear(err = 'Cancelled') {

    for (const item of this[QUEUE]) item.reject(new Error(err));

    this[QUEUE].length = 0;
  }

  get resolvingCount() {
    return this[CURRENT].length;
  }

  get queuedCount() {
    return this[QUEUE].length;
  }

  get length() {
    return this.queuedCount + this.resolvingCount;
  }

  get count() {
    return this.length;
  }

  get maxConcurrent() {
    return this[MAX_CONCURRENT];
  }

  get items() {

    const items = [...this[CURRENT], ...this[QUEUE]];

    return items.map(item => item.complete);
  }

  // Hooks

  onNext() {}

  onDone() {}

}

/******************************************************************************/
// Exports
/******************************************************************************/

PromiseQueue.Item = PromiseQueueItem;
exports.default = PromiseQueue;
exports.PromiseQueue = PromiseQueue;
exports.PromiseQueueItem = PromiseQueueItem;