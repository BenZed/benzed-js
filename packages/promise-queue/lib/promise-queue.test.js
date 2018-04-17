'use strict';

var _chai = require('chai');

var _promiseQueue = require('./promise-queue');

var _promiseQueue2 = _interopRequireDefault(_promiseQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Promise Queue', () => {

  describe('Setup', () => {

    it('is a class', () => {
      (0, _chai.expect)(_promiseQueue2.default).to.throw('cannot be invoked without \'new\'');
    });

    it('maxConcurrent as first argument', () => {
      const q = new _promiseQueue2.default(2);
      (0, _chai.expect)(q.maxConcurrent).to.be.equal(2);
    });

    it('maxConcurrent must be a number above zero', () => {
      for (const badValue of [0, -1, -Infinity, NaN, 'number', true, false]) (0, _chai.expect)(() => new _promiseQueue2.default(badValue)).to.throw('must be a number above zero');
    });
  });

  let num = 0;
  function count(t = 100) {
    const result = ++num;
    return new Promise(resolve => setTimeout(() => resolve(result), t));
  }

  afterEach(() => {
    num = 0;
  });

  describe('Usage', () => {

    describe('add()', () => {

      it('requires a promiser function', () => {
        const counter = new _promiseQueue2.default(1);
        (0, _chai.expect)(() => counter.add(null)).to.throw('takes a function that returns a promise');
      });

      it('takes functions that return promises and executes them consecutively', _asyncToGenerator(function* () {
        const counter = new _promiseQueue2.default(1);

        const one = counter.add(function () {
          return count(100);
        });
        const two = counter.add(function () {
          return count(50);
        });

        const result = yield Promise.race([one, two]);

        // promise 'one' should finish first even though it was configured to take
        // less time
        (0, _chai.expect)(result).to.be.equal(1);
      }));

      it('returns promises that resolve when given function is complete', _asyncToGenerator(function* () {
        const counter = new _promiseQueue2.default(1);

        const one = yield counter.add(function () {
          return count(100);
        });
        const two = yield counter.add(function () {
          return count(50);
        });

        (0, _chai.expect)(one).to.equal(1);
        (0, _chai.expect)(two).to.equal(2);
      }));

      it('maxConcurrent allows multple promises to be executed concurrently', _asyncToGenerator(function* () {
        const counter = new _promiseQueue2.default(2);

        const delay = 50;

        const start = Date.now();
        const one = counter.add(function () {
          return count(delay);
        });
        const two = counter.add(function () {
          return count(delay);
        });

        yield Promise.all([one, two]);

        const end = Date.now() - start;

        // If they weren't concurrent, end would be equal or above delay * 2
        (0, _chai.expect)(end).to.be.below(delay * 2);
      }));
    });

    describe('clear()', () => {

      it('Rejects promises waiting in queue', _asyncToGenerator(function* () {

        const counter = new _promiseQueue2.default(1);

        const one = counter.add(count);
        const two = counter.add(count);

        (0, _chai.expect)(counter.queuedCount).to.equal(1);

        counter.clear();

        let err;
        try {
          yield two;
        } catch (e) {
          err = e;
        }

        (0, _chai.expect)((yield one)).to.equal(1);
        (0, _chai.expect)(counter.queuedCount).to.equal(0);

        (0, _chai.expect)(err).to.have.property('message', 'Cancelled');
      }));

      it('Optionally takes a custom error message', _asyncToGenerator(function* () {

        const counter = new _promiseQueue2.default(1);
        const one = counter.add(count);
        const two = counter.add(count);

        counter.clear('Terminated');

        let err;
        try {
          yield two;
        } catch (e) {
          err = e;
        }

        (0, _chai.expect)((yield one)).to.equal(1);
        (0, _chai.expect)(err).to.have.property('message', 'Terminated');
      }));
    });

    describe('onNext() hook', () => {

      it('fires when next item in queue is run', _asyncToGenerator(function* () {
        const queue = new _promiseQueue2.default(1);

        let nexts = 0;
        queue.onNext = function () {
          nexts++;
        };
        yield queue.add(function () {
          return count();
        });
        yield queue.add(function () {
          return count();
        });

        (0, _chai.expect)(nexts).to.equal(2);
      }));

      it('receives raw item queue array', () => {
        const queue = new _promiseQueue2.default(1);

        let arr = null;
        queue.onNext = _arr => {
          arr = _arr;
        };
        queue.add(() => count());
        queue.add(() => count());

        (0, _chai.expect)(arr).to.be.instanceof(Array);
        (0, _chai.expect)(arr).to.have.length(1);
      });
    });

    describe('onDone() hook', () => {

      it('fires when item in queue is complete', _asyncToGenerator(function* () {
        const queue = new _promiseQueue2.default(1);

        let dones = 0;
        queue.onDone = function () {
          dones++;
        };
        yield queue.add(function () {
          return count();
        });
        yield queue.add(function () {
          return count();
        });

        (0, _chai.expect)(dones).to.equal(2);
      }));

      it('receives raw item queue array', _asyncToGenerator(function* () {
        const queue = new _promiseQueue2.default(1);

        let arr = null;
        queue.onDone = function (_arr) {
          arr = _arr;
        };
        yield queue.add(function () {
          return count();
        });
        yield queue.add(function () {
          return count();
        });

        (0, _chai.expect)(arr).to.be.instanceof(Array);
        (0, _chai.expect)(arr).to.have.length(0);
      }));
    });
  });
});