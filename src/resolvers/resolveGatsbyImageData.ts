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
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteUrlParams,
} from "../types";

export type ImgixLiteGatsbyImageDataArgs = {
	placeholder?: Exclude<
		ImgixLiteGatsbyImageDataPlaceholderKind,
		ImgixLiteGatsbyImageDataPlaceholderKind.DominantColor
	>;
	imgixParams?: ImgixLiteUrlParams;
	placeholderImgixParams?: ImgixLiteUrlParams;
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

	if (options.placeholder === ImgixLiteGatsbyImageDataPlaceholderKind.Blurred) {
		imageDataArgs.placeholderURL = getLowResolutionImageURL(imageDataArgs);
	}

	return generateImageData(imageDataArgs);
};
