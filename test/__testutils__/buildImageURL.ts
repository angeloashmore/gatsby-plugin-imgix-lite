import { ExecutionContext } from "ava";
import * as crypto from "crypto";

/**
 * Generates a unique image URL.
 *
 * @param t - Test execution context from which a URL will be generated.
 * @param index - An optional index to differentiate the generated URL from
 *   other in the same test.
 *
 * @returns The generated unique URL.
 */
export const buildImageUrl = (t: ExecutionContext, index = 0): string => {
	const basename = crypto.createHash("md5").update(t.title).digest("hex");

	return `https://example.com/${index}-${basename}.png`;
};
