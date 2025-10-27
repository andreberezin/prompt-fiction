
// available format types
export const FORMATTYPES = ['markdown', 'plainText'] as const;

// union type derived from the array
export type FormatType = (typeof FORMATTYPES)[number]