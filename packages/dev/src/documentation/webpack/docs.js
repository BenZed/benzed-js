
/******************************************************************************/
// Helpers
/******************************************************************************/

function toComponents (imported) {

  return Object
    .values(imported)
    .map(component => {
      return {
        type: 'component',
        name: component.name,
        component
      }
    })
}

/******************************************************************************/
// Exports
/******************************************************************************/

module.exports = [
  {
    'name': 'benzed',
    'type': 'repo',
    'children': [
      {
        'name': 'app',
        'type': 'package',
        'children': [
          ...toComponents(require('../../../../app/src/app.doc')),
          {
            'name': 'services',
            'type': 'module',
            'children': [
              ...toComponents(require('../../../../app/src/services/file-service.doc')),
              ...toComponents(require('../../../../app/src/services/service.doc')),
              ...toComponents(require('../../../../app/src/services/user-service.doc'))
            ]
          }
        ]
      },
      {
        'name': 'array',
        'type': 'package',
        'children': [
          ...toComponents(require('../../../../array/src/adjacent.doc')),
          ...toComponents(require('../../../../array/src/flatten.doc')),
          ...toComponents(require('../../../../array/src/pluck.doc'))
        ]
      },
      {
        'name': 'react',
        'type': 'package',
        'children': [
          {
            'name': 'app',
            'type': 'module',
            'children': [
              {
                'name': 'store',
                'type': 'module',
                'children': [
                  ...toComponents(require('../../../../react/src/app/store/client-store.doc'))
                ]
              }
            ]
          },
          {
            'name': 'util',
            'type': 'module',
            'children': [
              ...toComponents(require('../../../../react/src/util/styler.doc'))
            ]
          }
        ]
      },
      {
        'name': 'string',
        'type': 'package',
        'children': [
          ...toComponents(require('../../../../string/src/between.doc'))
        ]
      }
    ]
  }
]
