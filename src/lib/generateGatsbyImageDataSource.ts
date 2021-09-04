import type { IGatsbyImageHelperArgs } from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";

import { DEFAULT_IMGIX_PARAMS } from "../constants";
import type { ImgixLiteGatsbyImageDataArgs } from "../resolvers/resolveGatsbyImageData";

import { stripURLParameters } from "./stripURLParameters";

export const generateGatsbyImageDataSource: IGatsbyImageHelperArgs["generateImageSource"] =
	(
		filename,
		width,
		height,
		format,
		_fit,
		options?: ImgixLiteGatsbyImageDataArgs,
	) => {
		const url = stripURLParameters(filename);
		const client = new ImgixClient({
			domain: new URL(url).hostname,
		});

		const imgixParams = {
			...DEFAULT_IMGIX_PARAMS,
			...options?.imgixParams,
			w: width,
			h: height,
		};

		return {
			src: client.buildURL(url, imgixParams),
			width,
			height,
			format,
		};
	};
