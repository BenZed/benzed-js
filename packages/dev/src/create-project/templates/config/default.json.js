
export default ({ ui, files, auth, api, socketio, rest, pretty, name }) => api && {

  services: {
    users: auth || undefined,
    files: files || undefined
  },

  rest: rest && ui
    ? {
      public: './dist/public',
      favicon: null
    }
    : rest,

  socketio,

  mongodb: auth || files ? {
    database: name,
    hosts: 'localhost:5200'
  } : undefined,

  auth: auth && {
    service: 'users',
    entity: 'user'
  },

  port: 5100,

  logging: true

}
