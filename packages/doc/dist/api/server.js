'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app = require('@benzed/app');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _services = require('./services');

var services = _interopRequireWildcard(_services);

var _website = require('../ui/root/website');

var _website2 = _interopRequireDefault(_website);

var _docs = require('../docs');

var _docs2 = _interopRequireDefault(_docs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Static Website
/******************************************************************************/

const StaticWebsite = () => _react2.default.createElement(_website2.default, { packages: _docs2.default });

/******************************************************************************/
// App
/******************************************************************************/

class DocumentationServer extends _app.App {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.services = services, _temp;
  }

  getClientComponent() {
    return StaticWebsite;
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = DocumentationServer;