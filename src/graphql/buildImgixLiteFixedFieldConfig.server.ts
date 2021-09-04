import type { NodePluginSchema } from "gatsby";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import {
	GenerateImageSource,
	ImgixLiteGraphQLTypeName,
	ImgixLiteUrlParams,
} from "../types";
import { DEFAULT_FIXED_WIDTH } from "../constants";
import { resolveFixed, ImgixLiteFixedArgs } from "../resolveFixed";

type BuildImgixLiteFixedFieldConfigConfig<TSource> = {
	generateImageSource: GenerateImageSource<TSource>;
	schema: NodePluginSchema;
	defaultImgixParams?: ImgixLiteUrlParams;
	defaultPlaceholderImgixParams?: ImgixLiteUrlParams;
};

export const buildImgixLiteFixedFieldConfig = <TSource, TContext>(
	config: BuildImgixLiteFixedFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	ImgixLiteFixedArgs
> => {
	return {
		type: ImgixLiteGraphQLTypeName.ImageFixedObject,
		// IMPORTANT: These types must be kept in sync with `ImgixLiteFluidArgs`.
		args: {
			width: {
				type: "Int",
				defaultValue: DEFAULT_FIXED_WIDTH,
			},
			height: "Int",
			imgixParams: {
				type: ImgixLiteGraphQLTypeName.ImgixParamsInputObject,
				defaultValue: {},
			},
			placeholderImgixParams: {
				type: ImgixLiteGraphQLTypeName.ImgixParamsInputObject,
				defaultValue: {},
			},
		},
		resolve: (source, args) => {
			const imageSource = config.generateImageSource(source);

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
