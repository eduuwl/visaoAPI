import { Sequelize } from 'sequelize';

// Conectar ao banco de dados SQLite que está no zepellin
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'C:/Users/eduardoc.silva/Desktop/zepellin/database.sqlite', 
});

export default sequelize;
