import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('processos_db', 'postgres', 'shazam', {
  host: 'localhost',
  port: 5435,
  dialect: 'postgres',
});

module.exports = sequelize;