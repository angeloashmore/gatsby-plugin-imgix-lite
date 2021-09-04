import type { NodePluginSchema, GatsbyCache } from "gatsby";
import {
	IGatsbyGraphQLFieldConfig,
	getGatsbyImageResolver,
} from "gatsby-plugin-image/graphql-utils";

import { GenerateImageSource, GraphQLTypeName, ImgixParams } from "../types";
import {
	ImgixLiteGatsbyImageDataArgs,
	resolveGatsbyImageData,
} from "../resolvers/resolveGatsbyImageData.server";

type BuildImgixLiteGatsbyImageDataResolverConfig<TSource> = {
	pluginName: string;
	generateImageSource: GenerateImageSource<TSource>;
	schema: NodePluginSchema;
	cache: GatsbyCache;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
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
						pluginName: config.pluginName,
					},
				);
			}
		},

		// IMPORTANT: These types must be kept in sync with `ImgixLiteGatsbyImageDataArgs`.
		{
			placeholder: {
				type: GraphQLTypeName.GatsbyImageDataPlaceholderEnum,
			},
			imgixParams: {
				type: GraphQLTypeName.ImgixParamsInputObject,
			},
			placeholderImgixParams: {
				type: GraphQLTypeName.ImgixParamsInputObject,
			},
		},
	);
};
