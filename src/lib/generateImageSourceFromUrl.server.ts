import { GatsbyCache } from "gatsby";

import { ImageSource } from "../types";

import { fetchImageDimensions } from "./fetchImageDimensions.server";

type GenerateImageSourceFromUrlConfig = {
	cache: GatsbyCache;
};

export const generateImageSourceFromUrl = async (
	url: string,
	config: GenerateImageSourceFromUrlConfig,
): Promise<ImageSource | null> => {
	const dimensions = await fetchImageDimensions({
		url,
		cache: config.cache,
	});

	return {
		url,
		width: dimensions.width,
		height: dimensions.height,
	};
};
