// HTML déjà sûr : inséré tel quel dans un autre `html\`\``.
export class SafeHtml {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}
