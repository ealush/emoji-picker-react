// Build-time environment flag, replaced or provided by the consumer's
// bundler/runtime. Declared minimally so the library does not depend on
// Node's type definitions.
declare const process: { env: { NODE_ENV?: string } };
