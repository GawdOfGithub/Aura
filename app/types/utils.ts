// types/utils.ts

// Helper to convert snake_case string to camelCase
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

// The main utility: Deeply converts keys of an object or array
export type Camelize<T> = {
  [K in keyof T as SnakeToCamelCase<K & string>]: T[K] extends Array<infer U>
    ? Array<Camelize<U>> // If it's an array, convert the items inside
    : T[K] extends object
      ? Camelize<T[K]> // If it's a nested object, convert it too
      : T[K]; // Otherwise, leave it alone (string, number, etc.)
};
