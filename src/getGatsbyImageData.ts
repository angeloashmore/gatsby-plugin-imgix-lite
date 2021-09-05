import {
	IGatsbyImageData,
	IGetImageDataArgs,
	getImageData,
} from "gatsby-plugin-image";

import { name as packageName } from "../package.json";

import { generateGatsbyImageDataSource } from "./lib/generateGatsbyImageDataSource";

import { ImgixParams } from "./types";

export type GetGatsbyImageDataConfig = Omit<
	IGetImageDataArgs<never>,
	| "baseUrl"
	| "urlBuilder"
	| "sourceWidth"
	| "sourceHeight"
	| "width"
	| "aspectRatio"
	| "pluginName"
	| "options"
> & {
	src: string;
	imgixParams?: ImgixParams;
} & (
		| {
				sourceWidth: number;
				sourceHeight: number;
		  }
		| {
				width: number;
				aspectRatio: number;
		  }
	);

export const getGatsbyImageData = (
	config: GetGatsbyImageDataConfig,
): IGatsbyImageData => {
	let sourceWidth: number;
	let sourceHeight: number;
	if ("sourceWidth" in config && "sourceHeight" in config) {
		sourceWidth = config.sourceWidth;
		sourceHeight = config.sourceHeight;
	} else {
		sourceWidth = config.width;
		sourceHeight = config.width / config.aspectRatio;
	}

	return getImageData({
		...config,
		baseUrl: config.src,
		urlBuilder: (args) => {
			const gatsbyImageDataSource = generateGatsbyImageDataSource(
				args.baseUrl,
				args.width,
				args.height,
				args.format,
				undefined,
				args.options,
			);

			return gatsbyImageDataSource.src;
		},
		sourceWidth,
		sourceHeight,
		pluginName: packageName,
		options: {
			imgixParams: config.imgixParams,
		},
	});
};
