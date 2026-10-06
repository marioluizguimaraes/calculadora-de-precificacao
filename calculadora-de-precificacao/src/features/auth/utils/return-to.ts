/** Aceita só caminhos internos no `?voltar=` — evita redirecionar para outro site. */
export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export function loginPath(reason: string, returnTo: string): string {
  return `/entrar?${new URLSearchParams({ motivo: reason, voltar: returnTo }).toString()}`;
}

/** Iniciais para o avatar: "Lia Campos" → "LC". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}
