import type { GatsbyCache } from "gatsby";
import fetch from "node-fetch";

import { ImageSourceDimensions, ImgixJSONDimensionsLike } from "../types";

type FetchImageDimensionsConfig = {
	url: string;
	cache: GatsbyCache;
};

export const fetchImageDimensions = async (
	config: FetchImageDimensionsConfig,
): Promise<ImageSourceDimensions> => {
	const cacheKey = `dimensions___${config.url}`;
	const cacheValue: ImageSourceDimensions | undefined = await config.cache.get(
		cacheKey,
	);

	if (cacheValue) {
		return cacheValue;
	} else {
		const url = new URL(config.url);
		url.searchParams.set("fm", "json");

		const res = await fetch(url);
		const json = (await res.json()) as ImgixJSONDimensionsLike;
		const dimensions = {
			width: json.PixelWidth,
			height: json.PixelHeight,
		};

		config.cache.set(cacheKey, dimensions);

		return dimensions;
	}
};
