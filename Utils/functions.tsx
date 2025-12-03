export function tupleize<T>(arr: T[], N: number): T[][] {
    if (!Number.isInteger(N)) {
        throw new Error('supplied number must be an integer')
    }
    if (arr.length % N != 0) {
        throw new Error('supplied array length must be divisible by the supplied number')
    }
    const result: T[][] = []
    for (let index = 0; index < arr.length; index+= N) {
        result.push(arr.slice(index, index + N));
    }
    return result;
}