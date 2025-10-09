
// available content types
export const AIMODELS = ["gemini-2.5-flash", "gemini-2.5-pro"] as const;

// union type derived from the array
export type AImodel = (typeof AIMODELS)[number];