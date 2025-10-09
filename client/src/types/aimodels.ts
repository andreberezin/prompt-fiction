
// available content types
export const AIMODELS = [
    { model: "gemini-2.5-flash-lite", tooltip: "Ultra fast" },
    { model: "gemini-2.5-flash", tooltip: "Fast and intelligent" },
    { model: "gemini-2.5-pro", tooltip: "Most advanced" },
] as const;

// union type derived from the array
export type AImodel = (typeof AIMODELS)[number]["model"];
export type AIMODELObject = typeof AIMODELS[number];