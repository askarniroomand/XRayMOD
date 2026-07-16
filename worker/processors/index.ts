/**
 * @deprecated IOP processor pipeline is NOT used by the live Worker.
 * Active entrypoint: worker/router.ts (flat route table).
 * These files remain as reference for the FastAPI IOP middleware parity only.
 * Do not register this module from worker/index.ts.
 */

export const PROCESSORS_DEPRECATED = true as const;
