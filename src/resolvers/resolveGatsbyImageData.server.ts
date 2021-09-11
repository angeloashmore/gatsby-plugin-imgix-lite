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
import { paramCaseObject } from "../lib/paramCaseObject";

import { name as packageName } from "../../package.json";

import {
	ImageSource,
	ImgixParams,
	ImgixPalleteLike,
	ImgixClientConfig,
} from "../types";
import {
	DEFAULT_IMGIX_PARAMS,
	GatsbyImageDataLayoutKind,
	GatsbyImageDataPlaceholderKind,
} from "../constants";

export type GatsbyImageDataArgs = {
	placeholder?: GatsbyImageDataPlaceholderKind;
	imgixParams?: ImgixParams;
	placeholderImgixParams?: ImgixParams;
	layout?: GatsbyImageDataLayoutKind;
};

type ResolveGatsbyImageDataConfig = {
	cache: GatsbyCache;
	pluginName?: string;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const resolveGatsbyImageData = async (
	image: ImageSource,
	options: GatsbyImageDataArgs = {},
	config: ResolveGatsbyImageDataConfig,
): Promise<IGatsbyImageData | null> => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: config.pluginName || packageName,
		sourceMetadata: {
			width: image.width,
			height: image.height,
			format: "auto",
		},
		filename: image.url,
		generateImageSource: generateGatsbyImageDataSource({
			imgixClientConfig: config.imgixClientConfig,
		}),
		options,
		layout: options.layout,
	};

	if (options.placeholder === GatsbyImageDataPlaceholderKind.Blurred) {
		imageDataArgs.placeholderURL = await fetchBase64Image({
			url: getLowResolutionImageURL(imageDataArgs),
			cache: config.cache,
		});
	}

	if (options.placeholder === GatsbyImageDataPlaceholderKind.DominantColor) {
		const cacheKey = `${GatsbyImageDataPlaceholderKind.DominantColor}___${image.url}`;
		const cacheValue: string | undefined = await config.cache.get(cacheKey);

		if (cacheValue) {
			imageDataArgs.backgroundColor = cacheValue;
		} else {
			const url = new URL(image.url);
			const filename = decodeURIComponent(url.pathname);
			const client = new ImgixClient({
				domain: url.hostname,
				...config.imgixClientConfig,
			});

			const palleteUrl = client.buildURL(
				filename,
				paramCaseObject({
					...DEFAULT_IMGIX_PARAMS,
					...options.imgixParams,
					palette: "json",
				}),
			);
			const res = await fetch(palleteUrl);
			const json = (await res.json()) as ImgixPalleteLike;

			const dominantColor = json.dominant_colors.vibrant.hex;

			config.cache.set(cacheKey, dominantColor);

			imageDataArgs.backgroundColor = dominantColor;
		}
	}

	return generateImageData(imageDataArgs);
};
