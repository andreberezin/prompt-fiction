import * as React from "react";

export default function handleGenerationTimer(
    setGenerationTime: React.Dispatch<React.SetStateAction<number>>,
    generationTimeInterval: React.RefObject<number | null>, interval: number ): void
{
    setGenerationTime(0);
    generationTimeInterval.current = window.setInterval(() => setGenerationTime(current => current + interval), interval);
}