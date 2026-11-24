declare module '*/_prompts.mjs' {
  export const BANK: string
  export const TOPICS: string[]
  export const classifyPrompt: () => string
  export const phrasePrompt: (approved: string) => string
  export const briefPrompt: () => string
}
