/**
 * Server Entry Point - Colouring Montería
 */
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import app from './server';

// 1. Carga las variables de entorno PRIMERO
dotenv.config({ 
  path: path.resolve(__dirname, '../.env') 
});

// 2. Validación crítica de variables
const REQUIRED_ENV = ['PGUSER', 'PGPASSWORD', 'PGDATABASE'];
REQUIRED_ENV.forEach(variable => {
  if (!process.env[variable]) {
    console.error(`❌ Fatal Error: Missing ${variable} in .env`);
    process.exit(1);
  }
});

// 3. Configuración del servidor con mejores prácticas
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`
  ==================================
  🚀 Colouring Montería Server Running
  🔗 http://localhost:${PORT}
  📅 ${new Date().toLocaleString()}
  ==================================
  `);
  console.log('✅ Variables cargadas correctamente:');
  console.log(`   • PostgreSQL User: ${process.env.PGUSER}`);
  console.log(`   • Database: ${process.env.PGDATABASE}`);
  console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
})
.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} está en uso`);
  } else {
    console.error('❌ Error del servidor:', error.message);
  }
  process.exit(1);
});

// 4. Hot Module Replacement (HMR) para desarrollo
if (module.hot) {
  let currentApp = app;
  
  module.hot.accept('./server', () => {
    console.log('🔄 Recargando módulo del servidor...');
    server.removeListener('request', currentApp);
    const newApp = require('./server').default;
    server.on('request', newApp);
    currentApp = newApp;
  });
  
  console.log('✅ Server-side HMR Enabled!');
}