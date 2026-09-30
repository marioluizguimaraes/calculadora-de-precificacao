/** Identificador único para itens criados no cliente. */
export function createId(): string {
  return crypto.randomUUID();
}
