process.env.CDS_SERVER = 'express';
require('./srv/otel');

const cds = require('@sap/cds');
const express = require('express');
const pino = require('pino')();
const app = express();

// Agregamos las rutas manuales
app.get('/success', (_, res) => {
  pino.info('✅ Request to /success');
  res.send('Success!');
});

app.get('/error', () => {
  pino.error('💥 Simulated error on /error');
  throw new Error('Simulated error');
});

// Iniciamos CAP dentro de nuestro app de Express
cds
  .serve('all')
  .in(app)
  .then(() => {
    const port = process.env.PORT || 4004;
    app.listen(port, () => {
      console.log(`🚀 App escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al iniciar CDS:', err);
    process.exit(1);
  });
