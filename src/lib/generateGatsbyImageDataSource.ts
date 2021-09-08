import type { IGatsbyImageHelperArgs } from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";

import { DEFAULT_IMGIX_PARAMS } from "../constants";
import type { GatsbyImageDataArgs } from "../resolvers/resolveGatsbyImageData";

export const generateGatsbyImageDataSource: IGatsbyImageHelperArgs["generateImageSource"] =
	(sourceUrl, width, height, format, _fit, options?: GatsbyImageDataArgs) => {
		const url = new URL(sourceUrl);
		const filename = url.pathname;
		const client = new ImgixClient({
			domain: url.hostname,
		});

		const imgixParams = {
			...DEFAULT_IMGIX_PARAMS,
			...options?.imgixParams,
			w: width,
			h: height,
			fm: format,
		};

		return {
			src: client.buildURL(filename, imgixParams),
			width,
			height,
			format,
		};
	};
