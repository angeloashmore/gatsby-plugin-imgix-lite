import {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	generateImageData,
	getLowResolutionImageURL,
} from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";

import { stripURLParameters } from "./lib/stripURLParameters";

import {
	ImageSource,
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteUrlParams,
	ImgixPalleteLike,
} from "./types";
import { DEFAULT_IMGIX_PARAMS } from "./constants";
import { generateGatsbyImageDataSource } from "./generateGatsbyImageDataSource";

export type ImgixLiteGatsbyImageDataArgs = {
	placeholder?: ImgixLiteGatsbyImageDataPlaceholderKind;
	imgixParams?: ImgixLiteUrlParams;
	placeholderImgixParams?: ImgixLiteUrlParams;
};

export const resolveGatsbyImageData = async (
	image: ImageSource,
	options?: ImgixLiteGatsbyImageDataArgs,
): Promise<IGatsbyImageData | null> => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: "gatsby-source-prismic",
		sourceMetadata: {
			width: image.width,
			height: image.height,
			format: "",
		},
		filename: image.url,
		generateImageSource: generateGatsbyImageDataSource,
		options,
	};

	if (
		options?.placeholder === ImgixLiteGatsbyImageDataPlaceholderKind.Blurred
	) {
		imageDataArgs.placeholderURL = getLowResolutionImageURL(imageDataArgs);
	}

	if (
		options?.placeholder ===
		ImgixLiteGatsbyImageDataPlaceholderKind.DominantColor
	) {
		const url = stripURLParameters(image.url);
		const client = new ImgixClient({
			domain: new URL(url).hostname,
		});

		const palleteUrl = client.buildURL(url, {
			...DEFAULT_IMGIX_PARAMS,
			...options.imgixParams,
		});
		const res = await fetch(palleteUrl);
		const json: ImgixPalleteLike = await res.json();

		imageDataArgs.backgroundColor = json.dominant_colors.vibrant.hex;
	}

	return generateImageData(imageDataArgs);
};
