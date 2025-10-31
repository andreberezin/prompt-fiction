import * as React from "react";
import type {FormatOptions, FormatType} from "../../types/form-output/FormatType.ts";

export default function toggleFormat(key: FormatType, currentFormat: FormatOptions, setCurrentFormat: React.Dispatch<FormatOptions>) {
    const activeCount = Object.values(currentFormat).filter(Boolean).length;
    if (activeCount === 1 && currentFormat[key]) return;
    setCurrentFormat({ ...currentFormat, [key]: !currentFormat[key] });
}