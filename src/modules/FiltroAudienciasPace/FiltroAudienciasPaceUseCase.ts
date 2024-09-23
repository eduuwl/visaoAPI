/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import { loginUseCase } from '../LoginUsuario';
import { IGetArvoreDocumentoDTO } from '../../DTO/GetArvoreDocumentoDTO';
import { ResponseArvoreDeDocumento } from '../../sapiensOperations/response/ResponseArvoreDeDocumento';
import { getArvoreDocumentoUseCase } from '../GetArvoreDocumento/index';
import { contestacaoIsInvalid } from '../FiltroAssuntoPace/helps/ContestacaoIsInvalid';
import { getDocumentoUseCase } from '../GetDocumento';
import { ILoginDTO } from '../../DTO/LoginDTO';
import { getProcessoJudicialUseCase } from '../GetProcessoJudicial';
import { ResponseProcessoJudicial } from '../../sapiensOperations/response/ResponseProcessoJudicial';
import { PastaResponseArray } from '../../sapiensOperations/response/ResponsePasta';
import { getPastaProcessoJudicialUseCase } from '../GetPasta';
import { getUsuarioUseCase } from '../GetUsuario';

interface audienciasTipadas {
  processo: string;
  tipo: string;
}

export class FiltroAudienciasPaceUseCase {
  async execute(
    data: ILoginDTO,
    audiencias: string[],
  ): Promise<audienciasTipadas[]> {
    console.log('---FILTRO CONTESTAÇÃO');
    const response: audienciasTipadas[] = [];
    console.log(audiencias);
    try {
      const cookie: string = await loginUseCase.execute(data);

      const usuario = await getUsuarioUseCase.execute(cookie);
      console.log(usuario[0].nome);

      for (const audiencia of audiencias) {
        try {
          const processo: ResponseProcessoJudicial[] =
            await getProcessoJudicialUseCase.execute(cookie, audiencia);

          const id_processo = processo[0].id.toString();
          console.log(id_processo);
          const pasta: PastaResponseArray =
            await getPastaProcessoJudicialUseCase.execute(cookie, id_processo);

          const NUP = pasta[0].NUP;

          console.log('---------------------------');
          console.log(usuario[0].nome);
          console.log('---------------------------');

          const objectGetArvoreDocumento: IGetArvoreDocumentoDTO = {
            nup: NUP,
            cookie: cookie,
          };

          let arrayDeDocumentos: ResponseArvoreDeDocumento[] = [];
          try {
            arrayDeDocumentos = (
              await getArvoreDocumentoUseCase.execute(objectGetArvoreDocumento)
            ).reverse();
          } catch (error) {
            console.log('Erro ao buscar árvore de documentos: ', error);
          }

          const objectContestacao: ResponseArvoreDeDocumento | undefined =
            arrayDeDocumentos.find(
              (Documento) =>
                Documento.documentoJuntado.tipoDocumento.sigla == 'CONTEST' ||
                Documento.documentoJuntado.tipoDocumento.sigla == 'PROPACORD',
            );

          if (!objectContestacao) {
            console.warn(
              `CONTESTAÇÃO NÃO LOCALIZADA PARA O PROCESSO: ${audiencia}`,
            );
            continue;
          }

          const idContestacaoParaPesquisa: number =
            objectContestacao!.documentoJuntado.componentesDigitais[0].id;
          const paginaContestacao: string = await getDocumentoUseCase.execute({
            cookie,
            idDocument: idContestacaoParaPesquisa,
          });

          const tipoContestacao = await contestacaoIsInvalid(paginaContestacao);

          const objectAudienciaTipada = {
            processo: audiencia,
            tipo: tipoContestacao,
          };

          response.push(objectAudienciaTipada);
          console.log('PROCESSOS IDENTIFICADOS: ');
          console.log(response);
        } catch (error) {
          console.warn(`ERRO NA TRIAGEM DO PROCESSO: ${audiencia}`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login: ' + error);
    }

    return response;
  }
}
