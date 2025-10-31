
// available content types
export const AImodels = [
    { model: `gemini-2.5-flash-lite`, short: 'flash-lite', tooltip: "Ultra fast" },
    { model: "gemini-2.5-flash", short: 'flash', tooltip: "Fast and intelligent" },
    { model: "gemini-2.5-pro", short: 'pro',  tooltip: "Most advanced" },
] as const;

// union type derived from the array
export type AImodel = (typeof AImodels)[number]["model"];
export type AIMODELObject = typeof AImodels[number];