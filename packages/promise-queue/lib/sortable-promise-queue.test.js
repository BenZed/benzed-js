'use strict';

var _chai = require('chai');

var _src = require('../src');

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Sortable Promise Queue', () => {

  describe('Setup', () => {

    it('is a class', () => {
      (0, _chai.expect)(_src2.default.Sortable).to.throw('cannot be invoked without \'new\'');
    });

    it('extends PromiseQueue', () => {
      const q = new _src2.default.Sortable(2);
      (0, _chai.expect)(q).to.be.instanceof(_src2.default);
    });

    it('takes a sorter function as second argument', () => {

      const sorter = () => {};

      const q = new _src2.default.Sortable(2, sorter);
      (0, _chai.expect)(q.sorter).to.be.equal(sorter);
    });

    it('throws if sorter is defined but not a function', () => {

      (0, _chai.expect)(() => new _src2.default.Sortable()).to.not.throw();

      (0, _chai.expect)(() => new _src2.default.Sortable(1, 0)).to.throw('must be a function');
    });
  });

  const dollars = (length = 5) => new Promise(resolve => {
    setTimeout(() => resolve('$'.repeat(length)), 25);
  });

  describe('Usage', () => {

    describe('add()', () => {

      it('now takes an order value that sorts items before being fired next', _asyncToGenerator(function* () {

        const queue = new _src2.default.Sortable(1);

        const five = queue.add(function () {
          return dollars(5);
        }, 5);
        const one = queue.add(function () {
          return dollars(1);
        }, 1);
        const two = queue.add(function () {
          return dollars(2);
        }, 2);
        const three = queue.add(function () {
          return dollars(3);
        }, 3);
        const four = queue.add(function () {
          return dollars(4);
        }, 4);

        const order = [five, four, three, two, one];

        for (let i = 5; i >= 2; i--) {
          (0, _chai.expect)((yield Promise.race(order))).to.equal('$'.repeat(i));
          order.shift();
        }
      }));

      it('order can also be a function', _asyncToGenerator(function* () {

        const queue = new _src2.default.Sortable(1);

        queue.add(function () {
          return dollars(3);
        }, function () {
          return 1;
        });
        const two = queue.add(function () {
          return dollars(2);
        }, function () {
          return 2;
        });
        const three = queue.add(function () {
          return dollars(3);
        }, function () {
          return 3;
        });
        const four = queue.add(function () {
          return dollars(4);
        }, function () {
          return 4;
        });
        const five = queue.add(function () {
          return dollars(5);
        }, function () {
          return 5;
        });

        const order = [five, four, three, two];
        for (let i = 5; i >= 2; i--) {
          (0, _chai.expect)((yield Promise.race(order))).to.equal('$'.repeat(i));
          order.shift();
        }
      }));
    });
  });
});