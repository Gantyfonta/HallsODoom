/**
 * Public entry point of the Hollow Crown core.
 *
 * Everything the client (or a future server) is allowed to use from core is
 * exported here. If something is not exported, treat it as internal.
 */
export { SeededRng } from "./util/rng";

/** Bumped whenever the shape of save data changes. Used by save/ migrations. */
export const SAVE_FORMAT_VERSION = 1;

/** Bumped whenever the content-pack JSON format changes. See docs/CONTENT_PACK_FORMAT.md. */
export const CONTENT_PACK_FORMAT_VERSION = 1;
