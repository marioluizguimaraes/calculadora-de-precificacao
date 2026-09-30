/** Busca sem acento e sem diferenciar maiúsculas ("sao paulo" encontra "São Paulo"). */
export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
