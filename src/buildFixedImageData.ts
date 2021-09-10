import { FixedObject } from "gatsby-image";

import { ImgixParams } from "./types";
import { resolveFixed } from "./resolvers/resolveFixed";

export type BuildFixedObjectTypeConfig = {
	includeLibraryParam?: boolean;
};

/**
 * @deprecated `gatsby-image` is deprecated ("fixed" and "fluid" images). Use
 *   `gatsby-plugin-image` instead. You can use the `getGatsbyImageData`
 *   function to build an object like `buildFixedObjectType`.
 * @see {@link https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/ | Migrating from gatsby-image to gatsby-plugin-image}
 */
export const buildFixedImageData = (
	src: string,
	imgixParams: ImgixParams & { w: number; h: number },
	options: BuildFixedObjectTypeConfig = {},
): FixedObject => {
	return resolveFixed(
		{
			url: src,
			width: imgixParams.w,
			height: imgixParams.h,
		},
		{
			width: imgixParams.w,
			height: imgixParams.h,
			imgixParams,
		},
		{
			imgixClientConfig: {
				includeLibraryParam: options.includeLibraryParam,
			},
		},
	);
};
