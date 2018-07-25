'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('normalize.css');

var _docs = require('../docs');

var _docs2 = _interopRequireDefault(_docs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************/
// Dynamic Dependencies
/******************************************************************************/

const dependencies = Promise.all([import('react'), import('react-dom'), import('react-router-dom'), import('../ui/root')]);

/******************************************************************************/
// Helper
/******************************************************************************/

function getServerProps() {

  let props;
  try {

    const serverPropsTag = document.getElementById('benzed-documentation-server-props');

    props = JSON.parse(serverPropsTag.textContent);

    serverPropsTag.textContent = '';
  } catch (err) {}
  // it could be that the server sent bad data, but generally any failure
  // will simply mean no data has been sent


  // make double sure we're sending back an object
  return props !== null && typeof props === 'object' ? props : null;
}

function getMainTag() {
  return document.getElementById('benzed-documentation');
}

/******************************************************************************/
// Execute
/******************************************************************************/

dependencies.then(([{ default: React }, { hydrate }, { BrowserRouter }, { default: Website }]) => {

  const props = getServerProps();
  const main = getMainTag();

  const packagesWithDocs = _docs2.default.filter(pkg => pkg.doc.length > 0);

  const element = React.createElement(
    BrowserRouter,
    null,
    React.createElement(Website, _extends({}, props, {
      packages: packagesWithDocs }))
  );

  hydrate(element, main);
});