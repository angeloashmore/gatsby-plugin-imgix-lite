import type { FixedObject } from "gatsby-image";
import ImgixClient from "@imgix/js-core";

import { stripURLParameters } from "./lib/stripURLParameters";
import { parseArParam } from "./lib/parseArParam";

import { ImageSource, ImgixLiteUrlParams } from "./types";
import {
	DEFAULT_FIXED_WIDTH,
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from "./constants";

export type ImgixLiteFixedArgs = {
	width?: number;
	height?: number | null;
	imgixParams?: ImgixLiteUrlParams;
	placeholderImgixParams?: ImgixLiteUrlParams;
};

export const resolveFixed = (
	source: ImageSource,
	options?: ImgixLiteFixedArgs,
): FixedObject => {
	const resolvedOptions = {
		width: options?.width ?? DEFAULT_FIXED_WIDTH,
		height: options?.height,
		imgixParams: options?.imgixParams ?? {},
		placeholderImgixParams: options?.placeholderImgixParams ?? {},
	};

	const url = stripURLParameters(source.url);
	const client = new ImgixClient({
		domain: new URL(url).hostname,
	});

	let aspectRatio = source.width / source.height;
	if (resolvedOptions.imgixParams.ar === "string") {
		const parsedAr = parseArParam(resolvedOptions.imgixParams.ar);

		if (!Number.isNaN(parsedAr)) {
			aspectRatio = parsedAr;
		}
	} else if (resolvedOptions.width != null && resolvedOptions.height != null) {
		const requestedAr = resolvedOptions.width / resolvedOptions.height;

		if (requestedAr > 0 && Number.isFinite(requestedAr)) {
			aspectRatio = requestedAr;
		}
	}

	const width = resolvedOptions.width;
	const height = resolvedOptions.height ?? Math.round(width / aspectRatio);

	const imgixParams: ImgixLiteUrlParams = {
		...DEFAULT_IMGIX_PARAMS,
		...resolvedOptions.imgixParams,
		w: width,
		h: height,
	};

	const imgixParamsWebp: ImgixLiteUrlParams = {
		...imgixParams,
		fm: "webp",
	};

	const placeholderImgixParams: ImgixLiteUrlParams = {
		...imgixParams,
		...DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
		...resolvedOptions.placeholderImgixParams,
	};

	return {
		width,
		height,
		base64: client.buildURL(url, placeholderImgixParams),
		src: client.buildURL(url, imgixParams),
		srcWebp: client.buildURL(url, imgixParamsWebp),
		srcSet: client.buildSrcSet(url, imgixParams),
		srcSetWebp: client.buildSrcSet(url, imgixParamsWebp),
	};
};
