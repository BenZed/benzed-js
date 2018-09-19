
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
            'name': 'hooks',
            'type': 'module',
            'children': [
              ...toComponents(require('../../../../app/src/hooks/hook.doc'))
            ]
          },
          {
            'name': 'services',
            'type': 'module',
            'children': [
              {
                'name': 'file-service',
                'type': 'module',
                'children': [
                  ...toComponents(require('../../../../app/src/services/file-service/file-service.doc'))
                ]
              },
              ...toComponents(require('../../../../app/src/services/service.doc')),
              {
                'name': 'user-service',
                'type': 'module',
                'children': [
                  ...toComponents(require('../../../../app/src/services/user-service/user-service.doc'))
                ]
              }
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
          ...toComponents(require('../../../../array/src/pluck.doc')),
          ...toComponents(require('../../../../array/src/shuffle.doc')),
          ...toComponents(require('../../../../array/src/unique.doc')),
          ...toComponents(require('../../../../array/src/wrap.doc'))
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
            'name': 'store',
            'type': 'module',
            'children': [
              ...toComponents(require('../../../../react/src/store/observer.doc'))
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
          ...toComponents(require('../../../../string/src/between.doc')),
          ...toComponents(require('../../../../string/src/capitalize.doc')),
          ...toComponents(require('../../../../string/src/from-camel-case.doc')),
          ...toComponents(require('../../../../string/src/to-camel-case.doc'))
        ]
      }
    ]
  }
]
