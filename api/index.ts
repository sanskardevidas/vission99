// Vercel serverless entry. `npm run build` bundles server/vercel-entry.ts (and its dependencies) into
// api/_server.mjs, because the runtime cannot load the TypeScript sources directly.
// @ts-ignore -- generated at build time
import handler from './_server.mjs';

export default handler;
