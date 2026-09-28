import { html } from '@src/mail/application/html.js';

describe('SafeHtml', () => {
  it('reads as its HTML when slipped into a plain string', () => {
    expect(String(html`<b>${'Léa'}</b>`)).toBe('<b>Léa</b>');
  });
});
