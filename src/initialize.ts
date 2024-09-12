import sequelize from './config/db';
import Processos from './config/processos';

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    await sequelize.sync({ force: false }); 
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
}

initialize();
