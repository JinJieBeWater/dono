export const shouldNeverHappen = (msg?: string, ...args: any[]): never => {
  console.error(msg, ...args);
  if (import.meta.env.DEV) {
    // oxlint-disable-next-line no-debugger
    debugger;
  }
  throw new Error(`This should never happen: ${msg}`);
};
