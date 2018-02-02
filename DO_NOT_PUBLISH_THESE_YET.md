# DO NOT PUBLISH THESE YET

All of the package.json.main use 'src' as the main instead of 'lib'

This is so that I can get flow to import the typings correctly.

The flow development team are working on an option that will allow flow to import
from a different location than package.json.main.

If they do not finish this feature in a timely fashion, i'll create a postInstall
script that changes package.json.main from 'src' to 'lib' when these packages are
installed by npm.

For now, do not publish them, because once installed, they wont work.
