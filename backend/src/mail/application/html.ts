import { SafeHtml } from './safe-html.js';

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Gabarit HTML dont chaque valeur insérée est échappée (prénom saisi à l'inscription, etc.), sauf un SafeHtml.
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
  return new SafeHtml(
    strings.reduce((out, s, i) => {
      const v = values[i - 1];
      return out + (v instanceof SafeHtml ? v.value : escape(String(v))) + s;
    }),
  );
}
