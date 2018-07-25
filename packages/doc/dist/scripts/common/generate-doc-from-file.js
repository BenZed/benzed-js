'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PACKAGES = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isExplicit = require('is-explicit');

var _isExplicit2 = _interopRequireDefault(_isExplicit);

var _child_process = require('child_process');

var _os = require('os');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _flatten = require('./flatten');

var _flatten2 = _interopRequireDefault(_flatten);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/******************************************************************************/
// Data
/******************************************************************************/

const PACKAGES = _path2.default.resolve('../');

/******************************************************************************/
// Main
/******************************************************************************/

function generateDocsFromFile(url) {

  const stat = _fsExtra2.default.statSync(url);
  if (stat.isDirectory()) return (0, _flatten2.default)(_fsExtra2.default.readdirSync(url).map(name => _path2.default.join(url, name)).map(generateDocsFromFile).filter(_isExplicit2.default.defined));

  // cant make docs out of non-js
  if (_path2.default.extname(url) !== '.js') return null;

  // cant make docs of test files
  if (/\.test\.js$/.test(url)) return null;

  const rel = _path2.default.relative(PACKAGES, url);
  process.stdout.write(rel);
  const tmp = _path2.default.join((0, _os.tmpdir)(), _path2.default.basename(url) + 'on');

  let json = null;
  try {
    (0, _child_process.execSync)(`./node_modules/.bin/jsdoc -X ${url} > ${tmp}`);
    json = _fsExtra2.default.readJsonSync(tmp);
    _fsExtra2.default.removeSync(tmp);
  } catch (err) {
    process.stdout.write(` - error: ${err.message}`);
  }

  if (json) json = json.filter(obj => !obj.undocumented && obj.kind !== 'package').map((_ref) => {
    let { meta } = _ref,
        doc = _objectWithoutProperties(_ref, ['meta']);

    return Object(_extends({}, doc, { path: rel }));
  });

  process.stdout.write(` - ${json && json.length > 0 ? '√' : 'x'} \n`);

  return json && json.length > 0 ? json : null;
}
/******************************************************************************/
// Exports
/******************************************************************************/

exports.default = generateDocsFromFile;
exports.PACKAGES = PACKAGES;