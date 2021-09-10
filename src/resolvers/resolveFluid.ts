import type { FluidObject } from "gatsby-image";
import ImgixClient, { SrcSetOptions } from "@imgix/js-core";

import { paramCaseObject } from "../lib/paramCaseObject";
import { parseArParam } from "../lib/parseArParam";

import { ImageSource, ImgixClientConfig, ImgixParams } from "../types";
import {
	DEFAULT_FLUID_MAX_WIDTH,
	DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS,
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from "../constants";

export type FluidArgs = {
	maxWidth?: number;
	maxHeight?: number | null;
	srcSetBreakpoints?: number[];
	imgixParams?: ImgixParams;
	placeholderImgixParams?: ImgixParams;
};

type ResolveFluidConfig = {
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const resolveFluid = (
	source: ImageSource,
	options: FluidArgs = {},
	config: ResolveFluidConfig = {},
): FluidObject => {
	const url = new URL(source.url);
	const filename = decodeURIComponent(url.pathname);
	const client = new ImgixClient({
		domain: url.hostname,
		...config.imgixClientConfig,
	});

	let aspectRatio = source.width / source.height;
	if (typeof options.imgixParams?.ar === "string") {
		const parsedAr = parseArParam(options.imgixParams.ar);

		if (!Number.isNaN(parsedAr)) {
			aspectRatio = parsedAr;
		}
	} else if (options.maxWidth != null && options.maxHeight != null) {
		aspectRatio = options.maxWidth / options.maxHeight;
	}

	let maxWidth = DEFAULT_FLUID_MAX_WIDTH;
	if (options.maxWidth != null) {
		maxWidth = options.maxWidth;
	} else if (options.maxHeight != null) {
		maxWidth = Math.round(options.maxHeight * aspectRatio);
	}

	const imgixParams: ImgixParams = paramCaseObject({
		...DEFAULT_IMGIX_PARAMS,
		...options.imgixParams,
		w: maxWidth,
		ar: `${aspectRatio}:1`,
	});

	const imgixParamsWebp = {
		...imgixParams,
		fm: "webp",
	};

	const placeholderImgixParams: ImgixParams = paramCaseObject({
		...imgixParams,
		...DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
		...options.placeholderImgixParams,
	});

	const srcSetOptions: SrcSetOptions = {
		maxWidth,
		widths:
			options.srcSetBreakpoints ||
			DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS.map(
				(factor) => (options.maxWidth ?? DEFAULT_FLUID_MAX_WIDTH) * factor,
			),
	};

	return {
		aspectRatio,
		base64: client.buildURL(filename, placeholderImgixParams),
		src: client.buildURL(filename, imgixParams),
		srcWebp: client.buildURL(filename, imgixParamsWebp),
		srcSet: client.buildSrcSet(filename, imgixParams, srcSetOptions),
		srcSetWebp: client.buildSrcSet(filename, imgixParamsWebp, srcSetOptions),
		sizes: "(min-width: 8192px) 8192px 100vw",
	};
};
