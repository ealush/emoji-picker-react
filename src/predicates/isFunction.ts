export default function isFunction(
  value: any
): value is (...args: any[]) => any {
  return typeof value === 'function';
}
