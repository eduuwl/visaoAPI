export async function contestacaoIsInvalid(
  paginaContestacao: string,
): Promise<string> {
  const regex = /TIPO\s[1-5]/;

  const match = paginaContestacao.match(regex);
  if (match) {
    return match[0];
  }

  return 'SEM TIPO';
}
