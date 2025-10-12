// @ts-check
import { inspect } from "node:util";

const DEFAULT_MESSAGE = "Assertion failed";

const formatMessage = (message) => message ?? DEFAULT_MESSAGE;

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${formatMessage(message)}. Expected ${inspect(expected)} but received ${inspect(actual)}.`);
  }
}

export function assertDeepEqual(actual, expected, message) {
  const actualSerialized = inspect(actual, { depth: null, sorted: true });
  const expectedSerialized = inspect(expected, { depth: null, sorted: true });
  if (actualSerialized !== expectedSerialized) {
    throw new Error(`${formatMessage(message)}.\nExpected: ${expectedSerialized}\nActual:   ${actualSerialized}`);
  }
}

export async function assertThrows(fn, message) {
  try {
    await fn();
  } catch (error) {
    return error;
  }
  throw new Error(`${formatMessage(message)}. Expected function to throw.`);
}
