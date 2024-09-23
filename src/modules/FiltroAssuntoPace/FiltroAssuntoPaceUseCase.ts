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
// import { identificarDivXpathAssunto } from './helps/identificarDivXpathAssunto';
import { identificarDivXpathAdvogado } from './helps/identificarDivXpathAdvogado';
import  Processos  from '../../config/processos';
import { contestacaoIsInvalid } from '../FiltroAssuntoPace/helps/ContestacaoIsInvalid';
import { getDocumentoUseCase } from '../GetDocumento';


interface audienciasTipadas {
  processo: string;
  tipo: string;
}

export class FiltroAssuntoPaceUseCase {
  async execute(
    data: ILoginDTO,
    audiencias: string[],
  ): Promise<audienciasTipadas[]> {
    console.log('---FILTRO ASSUNTO');
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

           const capa: string = await getCapaUseCase.execute(NUP, cookie);
           const capaFormatada = new JSDOM(capa);
          // const divNumberAssunto = identificarDivXpathAssunto(capaFormatada);
          // const xpathAssunto = `/html/body/div/div[${divNumberAssunto}]/table/tbody/tr[2]/td[1]`;
          // const assunto = await getXPathText(capaFormatada, xpathAssunto);

          // pega o nome do advogado
          const divNumberAdvogado = identificarDivXpathAdvogado(capaFormatada);
          async function obterNomeAdvogado(capaFormatada: any): Promise<string | null> {
            let linhaAtual = 1;
          
            while (true) {
              
              const xpathHeader = `/html/body/div/div[6]/table/tbody/tr[1]/th[1]`;
              const advogadoHeader = await getXPathText(capaFormatada, xpathHeader);
          
              
              if (advogadoHeader.trim() === 'Nome') {
                console.log('Linha correta: ', xpathHeader);
          
                
                const xpathPossiveis = [
                  `/html/body/div/div[6]/table/tbody/tr[4]/td[1]/div/text()`,
                  `/html/body/div/div[6]/table/tbody/tr[5]/td[1]/div/text()`,
                  `/html/body/div/div[6]/table/tbody/tr[3]/td[1]/div/text()`,
                ];
          
                
                for (const xpath of xpathPossiveis) {
                  const advogadoNome = await getXPathText(capaFormatada, xpath);
          
                  
                  if (advogadoNome && advogadoNome.trim() !== '' && advogadoNome.trim() !== 'CENTRAL DE ANÁLISE DE BENEFÍCIO - CEAB/INSS') {
                    console.log('Nome do advogado encontrado: ', advogadoNome);
                    return advogadoNome.trim(); 
                  }
                }
          
                console.log('Nenhum nome válido de advogado encontrado.');
                return null;  
              }
          
              linhaAtual++;  
            }
          }
          
          // Chamada dentro do seu método execute
          const advogado = await obterNomeAdvogado(capaFormatada);
          console.log("nome do advogado:", advogado);
          
          if (advogado && advogado.trim() !== '') {
            await Processos.update(
              { TIPO: tipoContestacao, ADVOGADO: advogado },
              { where: { PROCESSO: audiencia } }
            );
          } else {
            console.error("Nome do advogado não encontrado ou inválido.");
          }
          
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
