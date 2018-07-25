'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _flatten = require('./common/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _sortByName = require('./common/sort-by-name');

var _sortByName2 = _interopRequireDefault(_sortByName);

var _generateDocFromFile = require('./common/generate-doc-from-file');

var _generateDocFromFile2 = _interopRequireDefault(_generateDocFromFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Data
/******************************************************************************/

const DOC_JSON = _path2.default.resolve('./src/docs.json');

const THIS_PACKAGE = _path2.default.basename(process.cwd());

/******************************************************************************/
// Helper
/******************************************************************************/

function generatePackageDocs(url) {

  const src = _path2.default.join(url, 'src');
  const packageJson = _path2.default.join(url, 'package.json');

  const { version, name, description } = _fsExtra2.default.readJsonSync(packageJson);
  const doc = (0, _flatten2.default)((0, _generateDocFromFile2.default)(src)).sort(_sortByName2.default);

  return {
    version,
    name: name.replace('@benzed/', ''),
    description,
    doc
  };
}

/******************************************************************************/
// Main
/******************************************************************************/

function generateDocs(config) {
  console.log('writing docs\n');

  const pkgdocs = _fsExtra2.default.readdirSync(_generateDocFromFile.PACKAGES).filter(name => name !== THIS_PACKAGE).map(name => _path2.default.join(_generateDocFromFile.PACKAGES, name)).filter(file => _fsExtra2.default.statSync(file).isDirectory()).map(generatePackageDocs);

  _fsExtra2.default.writeJsonSync(DOC_JSON, pkgdocs, { spaces: 2 });
}

/******************************************************************************/
// Exports
/******************************************************************************/

generateDocs();