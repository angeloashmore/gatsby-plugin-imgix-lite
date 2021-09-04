import type { FluidObject } from "gatsby-image";
import ImgixClient, { SrcSetOptions } from "@imgix/js-core";

import { stripURLParameters } from "../lib/stripURLParameters";
import { parseArParam } from "../lib/parseArParam";

import { ImageSource, ImgixLiteUrlParams } from "../types";
import {
	DEFAULT_FLUID_MAX_WIDTH,
	DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS,
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from "../constants";

export type ImgixLiteFluidArgs = {
	maxWidth?: number;
	maxHeight?: number | null;
	srcSetBreakpoints?: number[];
	imgixParams?: ImgixLiteUrlParams;
	placeholderImgixParams?: ImgixLiteUrlParams;
};

export const resolveFluid = (
	source: ImageSource,
	options?: ImgixLiteFluidArgs,
): FluidObject => {
	const resolvedOptions = {
		maxWidth: options?.maxWidth ?? DEFAULT_FLUID_MAX_WIDTH,
		maxHeight: options?.maxHeight,
		srcSetBreakpoints:
			options?.srcSetBreakpoints ??
			DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS.map(
				(factor) => (options?.maxWidth ?? DEFAULT_FLUID_MAX_WIDTH) * factor,
			),
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
	} else if (
		resolvedOptions.maxWidth != null &&
		resolvedOptions.maxHeight != null
	) {
		const requestedAr = resolvedOptions.maxWidth / resolvedOptions.maxHeight;

		if (requestedAr > 0 && Number.isFinite(requestedAr)) {
			aspectRatio = requestedAr;
		}
	}

	const maxWidth = resolvedOptions.maxWidth;
	const maxHeight =
		resolvedOptions.maxHeight ?? Math.round(maxWidth / aspectRatio);

	const imgixParams: ImgixLiteUrlParams = {
		...DEFAULT_IMGIX_PARAMS,
		...resolvedOptions.imgixParams,
		w: maxWidth,
		h: maxHeight,
		ar: aspectRatio,
	};

	const imgixParamsWebp = {
		...imgixParams,
		fm: "webp",
	};

	const placeholderImgixParams: ImgixLiteUrlParams = {
		...imgixParams,
		...DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
		...resolvedOptions.placeholderImgixParams,
	};

	const srcSetOptions: SrcSetOptions = {
		maxWidth,
		widths: resolvedOptions.srcSetBreakpoints,
	};

	return {
		aspectRatio,
		base64: client.buildURL(url, placeholderImgixParams),
		src: client.buildURL(url, imgixParams),
		srcWebp: client.buildURL(url, imgixParamsWebp),
		srcSet: client.buildSrcSet(url, imgixParams, srcSetOptions),
		srcSetWebp: client.buildSrcSet(url, imgixParamsWebp, srcSetOptions),
		sizes: "(min-width: 8192px) 8192px 100vw",
	};
};
