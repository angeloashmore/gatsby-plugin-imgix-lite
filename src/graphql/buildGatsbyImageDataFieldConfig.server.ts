import type { GatsbyCache } from "gatsby";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";
import { getGatsbyImageFieldConfig } from "gatsby-plugin-image/graphql-utils";

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
	const fieldConfig = getGatsbyImageFieldConfig<
		TSource,
		TContext,
		GatsbyImageDataArgs
	>(async (source, args) => {
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
	}) as ObjectTypeComposerFieldConfigAsObjectDefinition<
		TSource,
		TContext,
		GatsbyImageDataArgs
	>;

	// We need to set this separately since the above type cast raises the field
	// config to a graphql-compose definition. This allows us to reference types
	// by name, which is needed for the arguments.
	fieldConfig.args = {
		...(fieldConfig.args as NonNullable<typeof fieldConfig.args>),
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
	};

	// `getGatsbyImageFieldConfig` returns a "JSON!" type. This is undesired when
	// the source does not contain a value (i.e. null). Here, we are manually
	// overriding the type to be nullable.
	fieldConfig.type = "JSON";

	return fieldConfig;
};
