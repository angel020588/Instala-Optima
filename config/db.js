const { Sequelize } = require('sequelize');

// ✅ Validar variables de entorno requeridas
function validateDatabaseConfig() {
  const required = ['PGUSER', 'PGPASSWORD', 'PGHOST', 'PGPORT'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && !process.env.DATABASE_URL) {
    console.error('❌ Variables de entorno faltantes:', missing);
    console.log('💡 Configurando base de datos local SQLite como fallback...');
    return false;
  }
  return true;
}

// ✅ Configuración robusta para UltraBase de Hetzner
let sequelize;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  // Usar DATABASE_URL si está disponible
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (validateDatabaseConfig()) {
  // Construir conexión desde variables individuales
  const connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/ultrabase`;
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fallback a SQLite para desarrollo/testing
  console.log('🔄 Usando SQLite como base de datos de desarrollo');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:', // Base de datos en memoria para testing
    logging: false
  });
}

module.exports = sequelize;