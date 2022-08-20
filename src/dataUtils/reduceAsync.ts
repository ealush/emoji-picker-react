export async function reduceAsync<T, U>(
  array: T[],
  callback: (
    accumulator: U,
    currentValue: T,
    currentIndex: number,
    array: T[]
  ) => Promise<U>,
  initialValue: U
): Promise<U> {
  let accumulator = initialValue;
  for (let i = 0; i < array.length; i++) {
    accumulator = await callback(accumulator, array[i], i, array);
  }
  return accumulator;
}
