import {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	generateImageData,
	getLowResolutionImageURL,
} from "gatsby-plugin-image";

import { name as pkgName } from "../../package.json";

import { generateGatsbyImageDataSource } from "../lib/generateGatsbyImageDataSource";

import {
	ImageSource,
	GatsbyImageDataPlaceholderKind,
	ImgixParams,
} from "../types";

export type ImgixLiteGatsbyImageDataArgs = {
	placeholder?: Exclude<
		GatsbyImageDataPlaceholderKind,
		GatsbyImageDataPlaceholderKind.DominantColor
	>;
	imgixParams?: ImgixParams;
	placeholderImgixParams?: ImgixParams;
};

type ResolveGatsbyImageDataConfig = {
	pluginName: string;
};

export const resolveGatsbyImageData = (
	image: ImageSource,
	options: ImgixLiteGatsbyImageDataArgs = {},
	config?: ResolveGatsbyImageDataConfig,
): IGatsbyImageData => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: config?.pluginName || pkgName,
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
