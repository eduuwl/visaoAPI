/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
const xpath = require('xpath');

export function getXPathText(html: any, xpathExpression: string): string {
  const dom = html;
  const XPathResult = xpath.XPathResult;
  const nodes = dom.window.document.evaluate(
    xpathExpression,
    dom.window.document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );
  
  const textoDoXpathNaoExiste = nodes.singleNodeValue == null;
  if (textoDoXpathNaoExiste) {
    return 'ADVOGADO NÃO ENCONTRADO';
  }
  return nodes.singleNodeValue.textContent;
}
