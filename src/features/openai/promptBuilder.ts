export function buildPrompt(q: string, a: string, ua: string) {
  return `Q: ${q}\nA: ${a}\nUser: ${ua}`
}
