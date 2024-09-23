
export type Result<T> = {
    type: 'success',
    data: T,
} | {
    type: 'error',
    error: unknown,
} | {
    type: 'loading',
};
