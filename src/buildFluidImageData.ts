import { FluidObject } from "gatsby-image";

import { parseArParam } from "./lib/parseArParam";

import { ImgixParams } from "./types";
import { resolveFluid } from "./resolvers/resolveFluid";

export type BuildFluidObjectTypeConfig = {
	includeLibraryParam?: boolean;
	sizes?: string;
};

/**
 * @deprecated `gatsby-image` is deprecated ("fixed" and "fluid" images). Use
 *   `gatsby-plugin-image` instead. You can use the `getGatsbyImageData`
 *   function to build an object like `buildFluidObjectType`.
 * @see {@link https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/ | Migrating from gatsby-image to gatsby-plugin-image}
 */
export const buildFluidImageData = (
	src: string,
	imgixParams: ImgixParams & { ar: string },
	options: BuildFluidObjectTypeConfig = {},
): FluidObject => {
	const aspectRatio = parseArParam(imgixParams.ar);

	const fluid = resolveFluid(
		{
			url: src,
			width: aspectRatio,
			height: 1,
		},
		{
			imgixParams,
		},
		{
			imgixClientConfig: {
				includeLibraryParam: options.includeLibraryParam,
			},
		},
	);
	fluid.sizes = options.sizes ?? fluid.sizes;

	return fluid;
};
