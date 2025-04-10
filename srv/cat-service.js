const pino = require('pino')
const logger = pino()

module.exports = srv => {
  srv.on('sendLog', async req => {
    const entry = req.data.entry || req.data
    logger.info({ source: entry.source, msg: entry.message, level: entry.level }, '[APP_LOG]')
    return '✅ Log recibido y registrado con pino'
  })

  srv.on('READ', 'TestSuccess', () => {
    return [{ result: 'OK', timestamp: new Date().toISOString() }]
  })

  srv.on('READ', 'TestError', () => {
    throw new Error('💥 Error forzado para prueba')
  })
}

