import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import { GenerateImageSource, ImgixParams } from "../types";
import { DEFAULT_FIXED_WIDTH, GraphQLTypeName } from "../constants";
import { resolveFixed, ImgixLiteFixedArgs } from "../resolvers/resolveFixed";

type BuildImgixLiteFixedFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
};

export const buildImgixLiteFixedFieldConfig = <TSource, TContext>(
	config: BuildImgixLiteFixedFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	ImgixLiteFixedArgs
> => {
	return {
		type: config.namespace + GraphQLTypeName.FixedObject,
		// IMPORTANT: These types must be kept in sync with `ImgixLiteFluidArgs`.
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
				);
			} else {
				return null;
			}
		},
	};
};
