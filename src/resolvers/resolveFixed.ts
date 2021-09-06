import type { FixedObject } from "gatsby-image";
import ImgixClient from "@imgix/js-core";

import { parseArParam } from "../lib/parseArParam";

import { ImageSource, ImgixParams, ImgixClientConfig } from "../types";
import {
	DEFAULT_FIXED_WIDTH,
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from "../constants";

export type FixedArgs = {
	width?: number;
	height?: number | null;
	imgixParams?: ImgixParams;
	placeholderImgixParams?: ImgixParams;
};

export type ResolveFluidConfig = {
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const resolveFixed = (
	source: ImageSource,
	options: FixedArgs = {},
	config: ResolveFluidConfig = {},
): FixedObject => {
	const resolvedOptions = {
		width: options.width ?? DEFAULT_FIXED_WIDTH,
		height: options.height,
		imgixParams: options.imgixParams || {},
		placeholderImgixParams: options.placeholderImgixParams || {},
	};

	const url = new URL(source.url);
	const filename = url.pathname;
	const client = new ImgixClient({
		domain: url.hostname,
		...config.imgixClientConfig,
	});

	let aspectRatio = source.width / source.height;
	if (typeof resolvedOptions.imgixParams.ar === "string") {
		const parsedAr = parseArParam(resolvedOptions.imgixParams.ar);

		if (!Number.isNaN(parsedAr)) {
			aspectRatio = parsedAr;
		}
	}

	const width = resolvedOptions.width;
	const height = resolvedOptions.height ?? Math.round(width / aspectRatio);

	const imgixParams: ImgixParams = {
		...DEFAULT_IMGIX_PARAMS,
		...resolvedOptions.imgixParams,
		w: width,
		h: height,
	};

	const imgixParamsWebp: ImgixParams = {
		...imgixParams,
		fm: "webp",
	};

	const placeholderImgixParams: ImgixParams = {
		...DEFAULT_IMGIX_PARAMS,
		...resolvedOptions.imgixParams,
		...DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
		...resolvedOptions.placeholderImgixParams,
	};

	return {
		width,
		height,
		base64: client.buildURL(filename, placeholderImgixParams),
		src: client.buildURL(filename, imgixParams),
		srcWebp: client.buildURL(filename, imgixParamsWebp),
		srcSet: client.buildSrcSet(filename, imgixParams),
		srcSetWebp: client.buildSrcSet(filename, imgixParamsWebp),
	};
};
