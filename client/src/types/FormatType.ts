
// available format types
export const FORMATTYPES = ['markdown', 'plainText', 'richText'] as const;

// union type derived from the array
export type FormatType = (typeof FORMATTYPES)[number];

export type FormatOptions = {
    markdown: boolean,
    plainText: boolean,
    richText: boolean,
}