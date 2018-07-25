'use strict';

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Setup
/******************************************************************************/

const CONFIG_URL = _path2.default.resolve(process.cwd(), 'config');

/******************************************************************************/
// Execute
/******************************************************************************/

_api2.default.run(CONFIG_URL);