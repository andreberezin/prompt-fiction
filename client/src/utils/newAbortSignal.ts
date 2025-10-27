export default function newAbortSignal(
    timeoutMs: number,
    abortControllerRef: React.RefObject<AbortController | null>): AbortSignal {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setTimeout(() => abortController.abort("timeout"), timeoutMs);

    return abortController.signal;
}