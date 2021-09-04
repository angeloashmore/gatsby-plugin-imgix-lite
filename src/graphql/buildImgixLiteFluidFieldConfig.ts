import type { NodePluginSchema } from "gatsby";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import {
	GenerateImageSource,
	ImgixLiteGraphQLTypeName,
	ImgixLiteUrlParams,
} from "../types";
import { DEFAULT_FLUID_MAX_WIDTH } from "../constants";
import { resolveFluid, ImgixLiteFluidArgs } from "../resolvers/resolveFluid";

type BuildImgixLiteFluidFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
	schema: NodePluginSchema;
	defaultImgixParams?: ImgixLiteUrlParams;
	defaultPlaceholderImgixParams?: ImgixLiteUrlParams;
};

export const buildImgixLiteFluidFieldConfig = <TSource, TContext>(
	config: BuildImgixLiteFluidFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	ImgixLiteFluidArgs
> => {
	return {
		type: config.namespace + ImgixLiteGraphQLTypeName.ImageFluidObject,
		// IMPORTANT: These types must be kept in sync with `ImgixLiteFluidArgs`.
		args: {
			maxWidth: {
				type: "Int",
				defaultValue: DEFAULT_FLUID_MAX_WIDTH,
			},
			maxHeight: "Int",
			srcSetBreakpoints: "[Int!]",
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
				return resolveFluid(
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
