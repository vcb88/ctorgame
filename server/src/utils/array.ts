/**
 * Creates a mutable copy of a 2D array
 */
export function create2DArrayCopy<T>(
    array: ReadonlyArray<ReadonlyArray<T>>
): T[][] {
    return array.map(row => [...row]);
}

/**
 * Updates a value in a 2D array and returns a new array
 */
export function update2DArrayValue<T>(
    array: ReadonlyArray<ReadonlyArray<T>>,
    x: number,
    y: number,
    value: T
): T[][] {
    const newArray = create2DArrayCopy(array);
    newArray[y][x] = value;
    return newArray;
}