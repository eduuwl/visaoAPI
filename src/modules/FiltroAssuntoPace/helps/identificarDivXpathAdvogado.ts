/* eslint-disable @typescript-eslint/no-explicit-any */
import { getXPathText } from './GetTextoPorXPATH';

export const identificarDivXpathAdvogado = (capaFormatada: any): string | null => {
  let linhaAtual = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const xpathHeader = `/html/body/div/div[${linhaAtual}]/table/tbody/tr[1]/th[1]`;

    const advogadoHeader = getXPathText(capaFormatada, xpathHeader);

    if (advogadoHeader.trim() === 'Nome') {
      console.log('Linha correta: ', xpathHeader);

      const xpathPossiveis = [
        `/html/body/div/div[${linhaAtual}]/table/tbody/tr[5]/td[1]/div`,  
        `/html/body/div/div[${linhaAtual}]/table/tbody/tr[4]/td[1]/div`,  
        `/html/body/div/div[${linhaAtual}]/table/tbody/tr[3]/td[1]/div`,  
      ];

      for (const xpath of xpathPossiveis) {
        const advogadoNome = getXPathText(capaFormatada, xpath);

        if (advogadoNome && advogadoNome.trim() !== '') {
          console.log('Nome do advogado encontrado: ', advogadoNome);
          return advogadoNome;  
        }
      }

      console.log('Não encontrou o nome do advogado nas posições esperadas.');
      return null;  
    }

    linhaAtual++;  
  }
};

//NAO TA FUNCIONANDO, TERMINAR SEGUNDA
