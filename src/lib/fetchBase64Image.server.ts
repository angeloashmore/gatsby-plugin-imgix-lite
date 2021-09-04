import type { GatsbyCache } from "gatsby";
import fetch from "node-fetch";

type FetchBase64ImageConfig = {
	url: string;
	cache: GatsbyCache;
};

export const fetchBase64Image = async (
	config: FetchBase64ImageConfig,
): Promise<string> => {
	const cacheKey = `base64___${config.url}`;
	const cacheValue: string | undefined = await config.cache.get(cacheKey);

	if (cacheValue) {
		return cacheValue;
	} else {
		const res = await fetch(config.url);
		const buffer = await res.buffer();
		const contentType = res.headers.get("content-type");
		const base64 = `data:image/${contentType};base64,${buffer.toString(
			"base64",
		)}`;

		config.cache.set(cacheKey, base64);

		return base64;
	}
};
