import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import { GenerateImageSource, ImgixClientConfig, ImgixParams } from "../types";
import { DEFAULT_FLUID_MAX_WIDTH, GraphQLTypeName } from "../constants";
import { resolveFluid, FluidArgs } from "../resolvers/resolveFluid";

export type BuildFluidFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const buildFluidFieldConfig = <TSource, TContext>(
	config: BuildFluidFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	FluidArgs
> => {
	return {
		type: config.namespace + GraphQLTypeName.FluidObject,
		// IMPORTANT: These types must be kept in sync with `FluidArgs`.
		args: {
			maxWidth: {
				type: "Int",
				defaultValue: DEFAULT_FLUID_MAX_WIDTH,
			},
			maxHeight: "Int",
			srcSetBreakpoints: "[Int!]",
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
