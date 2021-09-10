import type { IGatsbyImageHelperArgs } from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";

import { DEFAULT_IMGIX_PARAMS } from "../constants";
import type { ImgixClientConfig, ImgixParams } from "../types";

// NOTE: This *server* file can only be imported for types!
import type { GatsbyImageDataArgs } from "../resolvers/resolveGatsbyImageData.server";

import { paramCaseObject } from "./paramCaseObject";

type GenerateGatsbyImageDataSourceConig = {
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const generateGatsbyImageDataSource = (
	config: GenerateGatsbyImageDataSourceConig,
): IGatsbyImageHelperArgs["generateImageSource"] => {
	return (
		sourceUrl,
		width,
		height,
		format,
		_fit,
		options?: GatsbyImageDataArgs,
	) => {
		const url = new URL(sourceUrl);
		const filename = decodeURIComponent(url.pathname);
		const client = new ImgixClient({
			domain: url.hostname,
			...config.imgixClientConfig,
		});

		const imgixParams: ImgixParams = paramCaseObject({
			...DEFAULT_IMGIX_PARAMS,
			...options?.imgixParams,
			w: width,
			h: height,
		});

		if (format && format !== "auto") {
			imgixParams.fm = format;
		}

		return {
			src: client.buildURL(filename, imgixParams),
			width,
			height,
			format,
		};
	};
};
