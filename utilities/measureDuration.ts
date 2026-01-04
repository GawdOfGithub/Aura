/**
 * Generic utility to measure the execution time of any async function.
 * * @param operationName - Optional tag for logging (e.g., "Upload", "Compression")
 * @param fn - The async function to execute.
 * @returns An object containing the result of the function and the duration in ms.
 */
export const measureDuration = async <T>(
    fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> => {
    const start = Date.now();

    // Await the function execution
    const result = await fn();

    const end = Date.now();
    return { result, durationMs: end - start };
};