/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { ILoginDTO } from '../../DTO/LoginDTO';
import { FiltroAssuntoPaceUseCase } from './FiltroAssuntoPaceUseCase';
import Processos from '../../config/processos'; // Importando o modelo de Processos

export class FiltroAssuntoPaceController {
  execute: any;

  constructor(private filtroAssuntoPaceUseCase: FiltroAssuntoPaceUseCase) {}

  // Função principal que vai lidar com o request e response
  async handle(request: Request, response: Response): Promise<Response> {
    const { cpf, senha } = request.body;  // Recebe CPF e senha da requisição
    const { processos } = request.body;   // Recebe os processos

    // Cria um objeto com os dados de login
    const data: ILoginDTO = {
      cpf: cpf,
      senha: senha,
    };

    try {
      // Chama o caso de uso que faz a lógica principal e obtém os resultados
      const result = await this.filtroAssuntoPaceUseCase.execute(data, processos);

      // Verifica se há resultados para serem atualizados
      if (result.length > 0) {
        for (const i of result) {
          // Função simples que atualiza o banco de dados SQLite com o TIPO do processo
          await this.atualizarTipoProcesso(i.processo, i.assunto);
        }
      }

      // Retorna os resultados em formato JSON
      return response.status(200).json(result);
    } catch (error: any) {
      // Retorna um erro se algo der errado
      return response.status(400).json({
        message: error.message || 'Unexpected error',
      });
    }
  }

  // Função simples para atualizar o tipo do processo no banco de dados SQLite
  private async atualizarTipoProcesso(PROCESSO: string, TIPO: string): Promise<void> {
    try {
      // Verificar se o processo existe
      const processoExistente = await Processos.findOne({
        where: { PROCESSO: PROCESSO }
      });
  
      if (!processoExistente) {
        console.log(`Processo ${PROCESSO} não encontrado.`);
        return;
      }
  
      // Atualizar o campo TIPO do processo no banco de dados
      const [numberOfAffectedRows] = await Processos.update(
        { TIPO: TIPO },
        { where: { PROCESSO: PROCESSO } }
      );
  
      console.log(`Número de linhas afetadas: ${numberOfAffectedRows}`);
  
      // Verificar se a atualização foi bem-sucedida
      if (numberOfAffectedRows > 0) {
        const processoAtualizado = await Processos.findOne({
          where: { PROCESSO: PROCESSO }
        });
        console.log(processoAtualizado);
      } else {
        console.log(`Nenhuma linha atualizada para o processo ${PROCESSO}.`);
      }
    } catch (error) {
      console.error(`Erro ao atualizar o processo ${PROCESSO}:`, error);
    }
  }
}
