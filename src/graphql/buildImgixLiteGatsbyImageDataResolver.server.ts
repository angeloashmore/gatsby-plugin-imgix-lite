import type { NodePluginSchema, GatsbyCache } from "gatsby";
import {
	IGatsbyGraphQLFieldConfig,
	getGatsbyImageResolver,
} from "gatsby-plugin-image/graphql-utils";

import {
	GenerateImageSource,
	ImgixLiteGraphQLTypeName,
	ImgixLiteUrlParams,
} from "../types";
import {
	ImgixLiteGatsbyImageDataArgs,
	resolveGatsbyImageData,
} from "../resolveGatsbyImageData.server";

type BuildImgixLiteGatsbyImageDataResolverConfig<TSource> = {
	generateImageSource: GenerateImageSource<TSource>;
	schema: NodePluginSchema;
	cache: GatsbyCache;
	defaultImgixParams?: ImgixLiteUrlParams;
	defaultPlaceholderImgixParams?: ImgixLiteUrlParams;
};

export const buildImgixLiteGatsbyImageDataResolver = <TSource, TContext>(
	config: BuildImgixLiteGatsbyImageDataResolverConfig<TSource>,
): IGatsbyGraphQLFieldConfig<
	TSource,
	TContext,
	ImgixLiteGatsbyImageDataArgs
> => {
	return getGatsbyImageResolver(
		(source, args) => {
			const imageSource = config.generateImageSource(source);

			if (imageSource !== null) {
				return resolveGatsbyImageData(
					{
						url: imageSource.url,
						width: imageSource.width,
						height: imageSource.height,
					},
					{
						...args,
						imgixParams: {
							...config.defaultImgixParams,
							...args.imgixParams,
						},
						placeholderImgixParams: {
							...config.defaultPlaceholderImgixParams,
							...args.placeholderImgixParams,
						},
					},
					{
						cache: config.cache,
					},
				);
			}
		},

		// IMPORTANT: These types must be kept in sync with `ImgixLiteGatsbyImageDataArgs`.
		{
			placeholder: {
				type: ImgixLiteGraphQLTypeName.GatsbyImageDataPlaceholderEnum,
			},
			imgixParams: {
				type: ImgixLiteGraphQLTypeName.ImgixParamsInputObject,
			},
			placeholderImgixParams: {
				type: ImgixLiteGraphQLTypeName.ImgixParamsInputObject,
			},
		},
	);
};
