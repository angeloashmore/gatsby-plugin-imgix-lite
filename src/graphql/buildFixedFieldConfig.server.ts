import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import { GenerateImageSource, ImgixClientConfig, ImgixParams } from "../types";
import { DEFAULT_FIXED_WIDTH, GraphQLTypeName } from "../constants";
import { resolveFixed, FixedArgs } from "../resolvers/resolveFixed";

export type BuildFixedFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const buildFixedFieldConfig = <TSource, TContext>(
	config: BuildFixedFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	FixedArgs
> => {
	return {
		type: config.namespace + GraphQLTypeName.FixedObject,
		// IMPORTANT: These types must be kept in sync with `FluidArgs`.
		args: {
			width: {
				type: "Int",
				defaultValue: DEFAULT_FIXED_WIDTH,
			},
			height: "Int",
			imgixParams: {
				type: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
				defaultValue: {},
			},
			placeholderImgixParams: {
				type: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
				defaultValue: {},
			},
		},
		resolve: async (source, args) => {
			const imageSource = await config.generateImageSource(source);

			if (imageSource !== null) {
				return resolveFixed(
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
						imgixClientConfig: config.imgixClientConfig,
					},
				);
			} else {
				return null;
			}
		},
	};
};
