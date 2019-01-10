import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { createElement, Component } from 'react'
import { $$entity } from '../util'
import { Test } from '@benzed/dev'
import styled from 'styled-components'
// eslint-disable-next-line no-unused-vars
import { Route, Switch } from 'react-router-dom'
import { Forbidden } from '@feathersjs/errors'

import fetch from 'isomorphic-fetch'

import fs from 'fs-extra'
import path from 'path'

// @jsx JSX
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const jsx = {
  app: func => func(declareEntity),
  react: func => func(createElement)
}

/******************************************************************************/
// Helper
/******************************************************************************/

const createHtml = (config = {}) => {
  const { name = 'index.html', id = 'entry', mutate } = config

  let data = `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <meta name='viewport'
      content='width=device-width,
      initial-scale=1,
      maximum-scale=1,
      user-scalable=no'
      >
    <title>Test Html</title>
  </head>
  <body>
    <main id='${id}'/>
  </body>
</html>`

  if (mutate)
    data = mutate(data)

  const dir = path.join(process.cwd(), 'temp', 'html')
  fs.ensureDirSync(dir)

  const url = path.join(dir, name)
  fs.writeFileSync(url, data, 'utf-8')

  return url
}

const expectBadlyFormedHtml = (doWithContents, doWithExpect, component) => {

  const url = createHtml({
    name: 'bad.html',
    mutate: doWithContents
  })

  return doWithExpect(
    expect(() => jsx.app(JSX =>
      <express-ui
        public={path.dirname(url)}
        html={url}
        component={component}
      />
    ))
  )
}

/******************************************************************************/
// Test
/******************************************************************************/

describe('<express-ui/>', () => {

  const goodHtml = createHtml()
  const goodPublic = path.dirname(goodHtml)

  it('can be created with jsx', () => {
    const ui = jsx.app(JSX => <express-ui public={goodPublic} />)

    expect(ui[$$entity]).to.have.property('type', 'express-ui')
  })

  describe('entity function', () => {

    it('requires express', () => {
      expect(jsx.app(JSX => <app>
        <express-ui public={goodPublic} />
      </app>))
        .to
        .throw('cannot use express ui without express enabled')

      expect(jsx.app(JSX => <app>
        <express/>
        <express-ui public={goodPublic} />
      </app>))
        .to
        .not
        .throw('cannot use express ui without express enabled')
    })

    describe('public prop', () => {
      it('is required', () => {
        expect(() =>
          jsx.app(JSX => <express-ui />))
          .to
          .throw('express-ui.public is required')
      })
      it('must be an existing directory')
    })

    describe('html prop', () => {

      it('defaults to public prop + \'/index.html\'', () => {
        expect(() =>
          jsx.app(JSX => <express-ui
            public={__dirname}
          />)
        ).to
          .throw(`express-ui.html must exist on the file system: ` +
            `${path.join(__dirname, 'index.html')}`
          )
      })

      it('must point to an existing html file', () => {
        expect(() =>
          jsx.app(JSX => <express-ui
            public={goodPublic}
            html={goodHtml.replace('index.html', 'missing.html')} />
          )
        ).to
          .throw('express-ui.html must exist on the file system')
      })

      describe('if combined with an component prop', () => {

        let component
        before(() => {
          component = jsx.react(JSX => props => <div>
            <h1>Page Title</h1>
          </div>)
        })

        it('throws if index.html doesn\'t have main tag', () => {
          expectBadlyFormedHtml(
            contents => contents.replace(/main/g, 'div'),
            to => to.throw(`main tag is not self closing or could not be found`),
            component
          )
        })

        it('throws if main tag is missing id', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('id=\'entry\'', ''),
            to => to.throw(`main tag does not have an id attribute`),
            component
          )
        })

        it('throws if id is empty', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('id=\'entry\'', 'id=\'\''),
            to => to.throw(`id is empty`),
            component
          )
        })

        it('throws if missing head tag', () => {
          expectBadlyFormedHtml(
            contents => contents.replace('</head>', ''),
            to => to.throw(`missing </head> tag`),
            component
          )
        })

      })
    })

    it('throws if not given an app as input')
    it('throws if result cannot be turned into memory service')

  })

  const get = async address => {

    const res = await fetch(address)
    const text = await res.text()

    return text
  }

  for (const { component, description, serializer, test } of [
    {
      component: null,
      serializer: null,
      description: 'serving a ui without a component or serializer',
      test: state => {
        it('receives the index.html', async () => {
          const ui = await get(state.address)
          expect(ui).to.include('<main id=\'entry\'')
        })
        it('should not have styles', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<style data-styled=')
        })
        it('should not have serialize tag', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<script id=\'entry-serialized\'')
        })
      }
    },

    {
      component: null,
      serializer: () => ({ names: [ 'Ron', 'Jerry', 'Steve' ] }),
      description: 'serving a ui with a serializer',
      test: state => {
        it('should have serialize tag', async () => {
          const ui = await get(state.address)
          expect(ui)
            .to
            .include('<script id=\'entry-serialized\' type=\'application/json\'')
        })
        it('script tag includes serialized data', async () => {
          const ui = await get(state.address)
          expect(ui)
            .to
            .include('{"names":["Ron","Jerry","Steve"]}')
        })
        it('should not have styles', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<style data-styled=')
        })
      }
    },

    {
      component: jsx.react(JSX => props =>
        <h1>Rendered {props.hydrated ? 'Server' : 'Client'} Side</h1>
      ),
      serializer: null,
      description: 'serving a ui with a react component',
      test: state => {
        it('receives react markup', async () => {
          const ui = await get(state.address)
          expect(ui).to.include('<h1>')
          expect(ui).to.include('</h1>')
        })
        it('receives "hydrated" prop serverside', async () => {
          const ui = await get(state.address)
          expect(ui).to.include('Server')
          expect(ui).to.not.include('Client')
        })
        it('should not have styles', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<style data-styled=')
        })
        it('should not have serialize tag', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<script id=\'entry-serialized\'')
        })
      }
    },

    {
      component: jsx.react(JSX => styled(props =>
        <div className={props.className}>
          {props.hydrated ? 'BLUE' : 'RED'}
        </div>)`
        background-color: ${props => props.hydrated ? 'blue' : 'red'}
      `),
      serializer: null,
      description: 'serving a ui with a styled react component',
      test: state => {
        it('receives styled-components style tag', async () => {
          const ui = await get(state.address)
          expect(ui).to.include('<style data-styled=')
        })
        it('receives "hydrated" prop serverside', async () => {
          const ui = await get(state.address)
          expect(ui).to.include('BLUE')
          expect(ui).to.include('background-color:blue')

          expect(ui).to.not.include('RED')
          expect(ui).to.not.include('background-color:red')
        })
        it('should not have serialize tag', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<script id=\'entry-serialized\'')
        })
      }
    },

    {
      component: jsx.react(JSX => props => <Switch>
        <Route path='/about' render={props => <h2>About</h2>}/>
        <Route path='/' render={props => <h1>Home</h1>}/>
      </Switch>),
      serializer: null,
      description: 'serving a ui with routing',
      test: state => {

        it('receives markup based on req.url', async () => {
          const home = await get(state.address)
          expect(home).to.include('<h1>Home</h1>')

          const about = await get(state.address + '/about')
          expect(about).to.include('<h2>About</h2>')
        })

        it('should not have styles', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<style data-styled=')
        })

        it('should not have serialize tag', async () => {
          const ui = await get(state.address)
          expect(ui).to.not.include('<script id=\'entry-serialized\'')
        })
      }
    },

    {
      component: jsx.react(JSX => class extends Component {
        render () {
          const { error } = this.props
          return error?.message || ''
        }
      }),
      serializer: null,
      description: 'serving a ui with error handling',
      test: state => {

        it('receives error in markup', async () => {
          const ui = await get(state.address + '/forbidden')
          expect(ui).to.include('Cannot go here.</main>')
        })

        it('receives error in serialized tag as well', async () => {
          const ui = await get(state.address + '/forbidden')
          expect(ui).to.include('<script id=\'entry-serialized\'')
          expect(ui).to.include('"code":403')
          expect(ui).to.include('"name":"Forbidden"')
          expect(ui).to.include('"message":"Cannot go here."')
        })

      }
    }

  ])
    Test.Api(jsx.app(JSX => <app>
      <express />
      {app => {
        app.get('/forbidden', (req, res, next) =>
          next(new Forbidden('Cannot go here.'))
        )
      }}
      <express-ui
        public={goodPublic}
        component={component}
        serialize={serializer}
      />
      <express-error />
    </app>),

    {
      client: false,
      description
    },

    test)

})
