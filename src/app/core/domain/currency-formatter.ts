const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formata um valor inteiro em centavos para moeda Real (BRL).
 *
 * @example
 * const formatted = formatBrlFromCents(129900); // "R$ 1.299,00"
 */
export function formatBrlFromCents(cents: number): string {
  if (!Number.isFinite(cents)) {
    throw new Error(`Valor monetário inválido: "${cents}". Esperado número finito em centavos.`);
  }

  return BRL_FORMATTER.format(cents / 100);
}
