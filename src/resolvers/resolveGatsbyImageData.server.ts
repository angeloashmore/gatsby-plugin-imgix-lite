import type { GatsbyCache } from "gatsby";
import {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	generateImageData,
	getLowResolutionImageURL,
} from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";
import fetch from "node-fetch";

import { fetchBase64Image } from "../lib/fetchBase64Image.server";
import { generateGatsbyImageDataSource } from "../lib/generateGatsbyImageDataSource";
import { stripURLParameters } from "../lib/stripURLParameters";

import { name as pkgName } from "../../package.json";

import {
	ImageSource,
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteUrlParams,
	ImgixPalleteLike,
} from "../types";
import { DEFAULT_IMGIX_PARAMS } from "../constants";

export type ImgixLiteGatsbyImageDataArgs = {
	placeholder?: ImgixLiteGatsbyImageDataPlaceholderKind;
	imgixParams?: ImgixLiteUrlParams;
	placeholderImgixParams?: ImgixLiteUrlParams;
};

type ResolveGatsbyImageDataConfig = {
	cache: GatsbyCache;
	pluginName?: string;
};

export const resolveGatsbyImageData = async (
	image: ImageSource,
	options: ImgixLiteGatsbyImageDataArgs = {},
	config: ResolveGatsbyImageDataConfig,
): Promise<IGatsbyImageData | null> => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: config.pluginName || pkgName,
		sourceMetadata: {
			width: image.width,
			height: image.height,
			format: "",
		},
		filename: image.url,
		generateImageSource: generateGatsbyImageDataSource,
		options,
	};

	if (options.placeholder === ImgixLiteGatsbyImageDataPlaceholderKind.Blurred) {
		imageDataArgs.placeholderURL = await fetchBase64Image({
			url: getLowResolutionImageURL(imageDataArgs),
			cache: config.cache,
		});
	}

	if (
		options.placeholder ===
		ImgixLiteGatsbyImageDataPlaceholderKind.DominantColor
	) {
		const cacheKey = `${ImgixLiteGatsbyImageDataPlaceholderKind.DominantColor}___${image.url}`;
		const cacheValue: string | undefined = await config.cache.get(cacheKey);

		if (cacheValue) {
			imageDataArgs.backgroundColor = cacheValue;
		} else {
			const url = stripURLParameters(image.url);
			const client = new ImgixClient({
				domain: new URL(url).hostname,
			});

			const palleteUrl = client.buildURL(url, {
				...DEFAULT_IMGIX_PARAMS,
				...options.imgixParams,
			});
			const res = await fetch(palleteUrl);
			const json = (await res.json()) as ImgixPalleteLike;

			const dominantColor = json.dominant_colors.vibrant.hex;

			config.cache.set(cacheKey, dominantColor);

			imageDataArgs.backgroundColor = dominantColor;
		}
	}

	return generateImageData(imageDataArgs);
};
