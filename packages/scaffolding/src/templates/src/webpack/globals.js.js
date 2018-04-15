
export default ({ has, projectName }) => has.ui && `
import 'normalize.css'
import './assets/${projectName}.css'
`
