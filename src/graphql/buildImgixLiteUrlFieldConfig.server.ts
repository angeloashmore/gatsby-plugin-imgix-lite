import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";
import ImgixClient from "@imgix/js-core";

import { stripURLParameters } from "../lib/stripURLParameters";

import { GenerateImageSource, ImgixParams } from "../types";
import { DEFAULT_IMGIX_PARAMS, GraphQLTypeName } from "../constants";

type ImgixLiteUrlArgs = {
	imgixParams: ImgixParams;
};

type BuildImgixLiteUrlFieldConfigConfig<TSource> = {
	namespace: string;
	generateImageSource: GenerateImageSource<TSource>;
};

export const buildImgixLiteUrlFieldConfig = <TSource, TContext>(
	config: BuildImgixLiteUrlFieldConfigConfig<TSource>,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	TSource,
	TContext,
	ImgixLiteUrlArgs
> => {
	return {
		type: "String",
		// IMPORTANT: These types must be kept in sync with `ImgixLiteUrlArgs`.
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
				});

				return client.buildURL(url, {
					...DEFAULT_IMGIX_PARAMS,
					...args.imgixParams,
				});
			} else {
				return null;
			}
		},
	};
};
