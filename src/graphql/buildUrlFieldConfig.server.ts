import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";
import ImgixClient from "@imgix/js-core";

import { stripURLParameters } from "../lib/stripURLParameters";

import { GenerateImageSource, ImgixClientConfig, ImgixParams } from "../types";
import { DEFAULT_IMGIX_PARAMS, GraphQLTypeName } from "../constants";

export type UrlArgs = {
	imgixParams: ImgixParams;
};

export type BuildUrlFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
	client?: ImgixClient;
	defaultImgixParams?: ImgixParams;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const buildUrlFieldConfig = <TSource, TContext>(
	config: BuildUrlFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	UrlArgs
> => {
	return {
		type: "String",
		// IMPORTANT: These types must be kept in sync with `ImgixUrlArgs`.
		args: {
			imgixParams: {
				type: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
				defaultValue: {},
			},
		},
		resolve: async (source, args) => {
			const imageSource = await config.generateImageSource(source);

			if (imageSource !== null) {
				const url = stripURLParameters(imageSource.url);
				const client = new ImgixClient({
					domain: new URL(url).hostname,
					...config.imgixClientConfig,
				});

				return client.buildURL(url, {
					...DEFAULT_IMGIX_PARAMS,
					...config.defaultImgixParams,
					...args.imgixParams,
				});
			} else {
				return null;
			}
		},
	};
};
