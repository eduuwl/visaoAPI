/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import { JSDOM } from 'jsdom';
import { loginUseCase } from '../LoginUsuario';
import { IGetArvoreDocumentoDTO } from '../../DTO/GetArvoreDocumentoDTO';
import { ResponseArvoreDeDocumento } from '../../sapiensOperations/response/ResponseArvoreDeDocumento';
import { getArvoreDocumentoUseCase } from '../GetArvoreDocumento/index';
import { ILoginDTO } from '../../DTO/LoginDTO';
import { getProcessoJudicialUseCase } from '../GetProcessoJudicial';
import { ResponseProcessoJudicial } from '../../sapiensOperations/response/ResponseProcessoJudicial';
import { PastaResponseArray } from '../../sapiensOperations/response/ResponsePasta';
import { getPastaProcessoJudicialUseCase } from '../GetPasta';
import { getCapaUseCase } from '../GetCapa';
import { getXPathText } from './helps/GetTextoPorXPATH';
import { getUsuarioUseCase } from '../GetUsuario';
import { identificarDivXpathAssunto } from './helps/identificarDivXpathAssunto';
import { identificarDivXpathAdvogado } from './helps/identificarDivXpathAdvogado';
import  Processos  from '../../config/processos';

interface audienciasTipadas {
  processo: string;
  assunto: string;
}

export class FiltroAssuntoPaceUseCase {
  async execute(
    data: ILoginDTO,
    audiencias: string[],
  ): Promise<audienciasTipadas[]> {
    console.log('---FILTRO ASSUNTO');
    const response: audienciasTipadas[] = [];
    try {
      const cookie: string = await loginUseCase.execute(data);
      console.log(audiencias);

      const usuario = await getUsuarioUseCase.execute(cookie);
      console.log(usuario[0].nome);

      for (const audiencia of audiencias) {
        try {
          const processo: ResponseProcessoJudicial[] =
            await getProcessoJudicialUseCase.execute(cookie, audiencia);

          const id_processo = processo[0].id.toString();
          const pasta: PastaResponseArray =
            await getPastaProcessoJudicialUseCase.execute(cookie, id_processo);

          const NUP = pasta[0].NUP;

          const objectGetArvoreDocumento: IGetArvoreDocumentoDTO = {
            nup: NUP,
            cookie: cookie,
          };

          let arrayDeDocumentos: ResponseArvoreDeDocumento[] = [];
          try {
            arrayDeDocumentos = await getArvoreDocumentoUseCase.execute(
              objectGetArvoreDocumento,
            );
          } catch (error) {
            console.log('Erro ao buscar árvore de documentos: ', error);
          }

          const objectCapa: ResponseArvoreDeDocumento | undefined =
            arrayDeDocumentos.find(
              (Documento) =>
                Documento.documentoJuntado.tipoDocumento.nome == 'CAPA' ||
                Documento.movimento == 'CAPA',
            );

          console.log('---------------------------');
          console.log(usuario[0].nome);
          console.log('---------------------------');

          if (!objectCapa) {
            console.warn(`CAPA NÃO LOCALIZADA PARA O PROCESSO: ${audiencia}`);
            continue;
          }

          const capa: string = await getCapaUseCase.execute(NUP, cookie);
          const capaFormatada = new JSDOM(capa);
          const divNumberAssunto = identificarDivXpathAssunto(capaFormatada);
          const xpathAssunto = `/html/body/div/div[${divNumberAssunto}]/table/tbody/tr[2]/td[1]`;
          const assunto = await getXPathText(capaFormatada, xpathAssunto);

          const objectAudienciaTipada = {
            processo: audiencia,
            assunto: assunto,
          };

          // pega o nome do advogado
          const divNumberAdvogado = identificarDivXpathAdvogado(capaFormatada);
          const xpathAdvogado = `/html/body/div/div[${divNumberAdvogado}]/table/tbody/tr[2]/td[1]`;  // Linha onde está o nome do advogado
          const advogado = await getXPathText(capaFormatada, xpathAdvogado);

          console.log("nome do advogado:", advogado);

          await Processos.update(
            { TIPO: assunto, ADVOGADO: advogado},
            { where: { PROCESSO: audiencia} }
          );

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
