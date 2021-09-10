import { ExecutionContext } from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { buildImageUrl } from "./buildImageURL";

type InstantiateImageURLConfig = {
	server: mswNode.SetupServerApi;
	index?: number;
};

/**
 * Generates a unique image URL and registers an appropriate Imgix `fm=json` MSW
 * server handler.
 *
 * @param t - Test execution context from which a URL will be generated.
 * @param index - An optional index to differentiate the generated URL from
 *   other in the same test.
 *
 * @returns The generated unique URL.
 */
export const instantiateImageURL = (
	t: ExecutionContext,
	config: InstantiateImageURLConfig,
): string => {
	const url = buildImageUrl(t, config.index);

	config.server.use(
		msw.rest.get(url, (req, res, ctx) => {
			if (req.url.searchParams.get("fm") === "json") {
				return res.once(ctx.json({ PixelWidth: 400, PixelHeight: 200 }));
			}
		}),
	);

	return url;
};
