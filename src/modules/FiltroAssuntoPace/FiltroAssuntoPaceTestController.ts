import { Request, Response } from 'express';
import { FiltroAssuntoPaceUseCase } from './FiltroAssuntoPaceUseCase';
import { ILoginDTO } from '../../DTO/LoginDTO';

export class FiltroAssuntoPaceTestController {
  constructor(private filtroAssuntoPaceUseCase: FiltroAssuntoPaceUseCase) {}

  async testTipo(req: Request, res: Response): Promise<void> {
    const { loginData, audiencias } = req.query;

    if (!loginData || !audiencias) {
      res.status(400).send('Dados de login e audiências são necessários');
      return;
    }

    const data: ILoginDTO = JSON.parse(loginData as string);
    const audienciasArray: string[] = JSON.parse(audiencias as string);

    try {
      const resultado = await this.filtroAssuntoPaceUseCase.execute(data, audienciasArray);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao executar filtro: ', error);
      res.status(500).send('Erro ao executar filtro');
    }
  }
}
