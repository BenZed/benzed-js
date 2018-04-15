
export default ({ has, iff }) => has.api && `
src
test

.babelrc
.eslintrc.yml
.eslintignore

*temp.js

${iff(has.ui)`dist/webpack`}
`
