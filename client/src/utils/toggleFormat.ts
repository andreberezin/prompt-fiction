import * as React from "react";
import type {FormatType} from "../types/FormatType.ts";

type FormatOptions = {
    markdown: boolean,
    plainText: boolean
}

export default function toggleFormat(key: FormatType, currentFormat: FormatOptions, setCurrentFormat: React.Dispatch<FormatOptions>) {
    const activeCount = Object.values(currentFormat).filter(Boolean).length;
    if (activeCount === 1 && currentFormat[key]) return;
    setCurrentFormat({ ...currentFormat, [key]: !currentFormat[key] });
}