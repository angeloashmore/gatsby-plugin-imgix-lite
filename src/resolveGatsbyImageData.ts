import {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	generateImageData,
} from "gatsby-plugin-image";

import { name as pkgName } from "../package.json";

import {
	ImageSource,
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteUrlParams,
} from "./types";
import { generateGatsbyImageDataSource } from "./generateGatsbyImageDataSource";

export type ImgixLiteGatsbyImageDataArgs = {
	placeholder?: ImgixLiteGatsbyImageDataPlaceholderKind;
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

	return generateImageData(imageDataArgs);
};
