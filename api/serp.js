// Thin Vercel entrypoint. The implementation is pre-bundled so the runtime
// never has to resolve TypeScript source imports.
module.exports = require('../serverless/serp.cjs').default;
