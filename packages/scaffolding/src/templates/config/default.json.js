
export default ({ has, json }) => has.api && json({
  port: 5100,
  mongodb: has.rest || has.socketio
    ? {
      path: '../storage/data',
      host: 'localhost',
      port: 5200
    }
    : '\b',
  ui: has.ui
    ? {
      favicon: '../public/favicon.ico',
      public: '../public'
    }
    : '\b'
})
