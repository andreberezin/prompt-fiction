
// available content types
export const CONTENTTYPES = ["blog", "email"] as const;

// union type derived from the array
export type ContentType = (typeof CONTENTTYPES)[number];