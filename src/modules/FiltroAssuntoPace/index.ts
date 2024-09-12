import express from 'express';
import { FiltroAssuntoPaceController } from './FiltroAssuntoPaceController';
import { FiltroAssuntoPaceUseCase } from './FiltroAssuntoPaceUseCase';
import { FiltroAssuntoPaceTestController } from './FiltroAssuntoPaceTestController';
import sequelize from '../../config/db'; // Ajuste o caminho conforme necessário

sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Tabelas sincronizadas com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao sincronizar as tabelas:', error);
  });

const app = express();
app.use(express.json());

const filtroAssuntoPaceUseCase = new FiltroAssuntoPaceUseCase();
const filtroAssuntoPaceController = new FiltroAssuntoPaceController(filtroAssuntoPaceUseCase);
const filtroAssuntoPaceTestController = new FiltroAssuntoPaceTestController(filtroAssuntoPaceUseCase);

// Rota para o controller principal
app.post('/filtro-assunto', (req, res) => filtroAssuntoPaceController.handle(req, res));

// Rota para teste
app.get('/testar-tipo', (req, res) => filtroAssuntoPaceTestController.testTipo(req, res));

// Configurar porta e iniciar servidor
app.listen(3004, () => {
  console.log('Servidor rodando na porta 3004');
});
