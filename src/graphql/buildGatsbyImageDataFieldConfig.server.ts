import type { GatsbyCache } from "gatsby";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";
import { getGatsbyImageResolver } from "gatsby-plugin-image/graphql-utils";

import { GenerateImageSource, ImgixClientConfig, ImgixParams } from "../types";
import { GraphQLTypeName, GatsbyImageDataPlaceholderKind } from "../constants";
import {
	GatsbyImageDataArgs,
	resolveGatsbyImageData,
} from "../resolvers/resolveGatsbyImageData.server";

export type BuildGatsbyImageDataFieldConfigConfig<TSource> = {
	namespace: string;
	pluginName: string;
	generateImageSource: GenerateImageSource<TSource>;
	cache: GatsbyCache;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const buildGatsbyImageDataFieldConfig = <TSource, TContext>(
	config: BuildGatsbyImageDataFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	GatsbyImageDataArgs
> => {
	const fieldConfig = getGatsbyImageResolver(
		async (source, args) => {
			const imageSource = await config.generateImageSource(source);

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
						imgixClientConfig: config.imgixClientConfig,
					},
				);
			} else {
				return null;
			}
		},

		// IMPORTANT: These types must be kept in sync with `GatsbyImageDataArgs`.
		{
			placeholder: {
				type: config.namespace + GraphQLTypeName.GatsbyImageDataPlaceholderEnum,
				defaultValue: GatsbyImageDataPlaceholderKind.DominantColor,
			},
			imgixParams: {
				type: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
			},
			placeholderImgixParams: {
				type: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
			},
		},
	) as ObjectTypeComposerFieldConfigAsObjectDefinition<
		TSource,
		TContext,
		GatsbyImageDataArgs
	>;

	// `getGatsbyImageResolver` returns a "JSON!" type. This is undesired when
	// the source does not contain a value (i.e. null). Here, we are manually
	// overriding the type to be nullable.
	fieldConfig.type = "JSON";

	return fieldConfig;
};
