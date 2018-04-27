
export default ({ ui }) => {

  const presets = [
    ['env', { targets: { node: 'current' } }]
  ]

  if (ui)
    presets.push('react')

  presets.push('stage-0')

  const plugins = ui
    ? [ 'styled-components' ]
    : undefined

  return {
    presets,
    plugins
  }

}
