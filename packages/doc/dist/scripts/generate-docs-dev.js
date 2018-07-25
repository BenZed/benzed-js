'use strict';

var _watchr = require('watchr');

var _watchr2 = _interopRequireDefault(_watchr);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _generateDocFromFile = require('./common/generate-doc-from-file');

var _generateDocFromFile2 = _interopRequireDefault(_generateDocFromFile);

var _sortByName = require('./common/sort-by-name');

var _sortByName2 = _interopRequireDefault(_sortByName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Data
/******************************************************************************/

const THIS_PACKAGE = _path2.default.basename(process.cwd());

const PACKAGE_NAMES = _fsExtra2.default.readdirSync(_generateDocFromFile.PACKAGES).filter(name => name !== THIS_PACKAGE);

const DOC_JSON = _path2.default.resolve('./src/docs.json');

/******************************************************************************/
// Listener
/******************************************************************************/

function listener(changeType, fullPath) {

  const name = this;

  const packages = _fsExtra2.default.readJsonSync(DOC_JSON);

  // only non-test js files
  if (!/\.js$/.test(fullPath) || /\.test\.js$/.test(fullPath)) return;

  const [pkg] = packages.filter(pkg => pkg.name === name);
  if (!pkg) return console.log(`package for ${name} could not be found`);

  const rel = _path2.default.relative(_generateDocFromFile.PACKAGES, fullPath);

  pkg.doc = (pkg.doc || []).filter(doc => doc.path !== rel);

  if (changeType !== 'deleted') pkg.doc.push(...((0, _generateDocFromFile2.default)(fullPath) || []));

  pkg.doc.sort(_sortByName2.default);

  _fsExtra2.default.writeJsonSync(DOC_JSON, packages, { spaces: 2 });
}

/******************************************************************************/
// Execute
/******************************************************************************/

require('./generate-docs');

PACKAGE_NAMES.map(name => _watchr2.default.open(_path2.default.join(_generateDocFromFile.PACKAGES, name, 'src'), listener.bind(name), err => console.log(err ? `${name} watch fail: ${err}` : `${name} watching`)));