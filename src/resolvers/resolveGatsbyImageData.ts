import {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	generateImageData,
	getLowResolutionImageURL,
} from "gatsby-plugin-image";

import { name as packageName } from "../../package.json";

import { generateGatsbyImageDataSource } from "../lib/generateGatsbyImageDataSource";

import { ImageSource, ImgixClientConfig, ImgixParams } from "../types";
import { GatsbyImageDataPlaceholderKind } from "../constants";

export type GatsbyImageDataArgs = {
	placeholder?: Exclude<
		GatsbyImageDataPlaceholderKind,
		GatsbyImageDataPlaceholderKind.DominantColor
	>;
	imgixParams?: ImgixParams;
	placeholderImgixParams?: ImgixParams;
};

type ResolveGatsbyImageDataConfig = {
	pluginName?: string;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const resolveGatsbyImageData = (
	image: ImageSource,
	options: GatsbyImageDataArgs = {},
	config: ResolveGatsbyImageDataConfig = {},
): IGatsbyImageData => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: config.pluginName || packageName,
		sourceMetadata: {
			width: image.width,
			height: image.height,
			format: "",
		},
		filename: image.url,
		generateImageSource: generateGatsbyImageDataSource,
		options,
	};

	if (options.placeholder === GatsbyImageDataPlaceholderKind.Blurred) {
		imageDataArgs.placeholderURL = getLowResolutionImageURL(imageDataArgs);
	}

	return generateImageData(imageDataArgs);
};
