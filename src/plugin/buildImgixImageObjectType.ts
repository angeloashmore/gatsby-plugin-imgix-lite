import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";

import { name as packageName } from "../../package.json";

import {
	buildImgixLiteFixedFieldConfig,
	buildImgixLiteFluidFieldConfig,
	buildImgixLiteGatsbyImageDataFieldConfig,
	buildImgixLiteUrlFieldConfig,
	ImgixParams,
	ImgixClientConfig,
} from "../index.server";

import { GraphQLTypeName, NAMESPACE } from "./constants";

type BuildImgixImageObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
	cache: GatsbyCache;
	defaultImgixParams?: ImgixParams;
	defaultPlaceholderImgixParams?: ImgixParams;
	imgixClientConfig?: Partial<ImgixClientConfig>;
};

export const buildImgixImageObjectType = (
	config: BuildImgixImageObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: config.namespace + GraphQLTypeName.Image,
		fields: {
			// @ts-expect-error - complex type resolution issue
			url: buildImgixLiteUrlFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			fixed: buildImgixLiteFixedFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: config.defaultImgixParams,
				defaultPlaceholderImgixParams: config.defaultImgixParams,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			fluid: buildImgixLiteFluidFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: config.defaultImgixParams,
				defaultPlaceholderImgixParams: config.defaultImgixParams,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			gatsbyImageData: buildImgixLiteGatsbyImageDataFieldConfig({
				namespace: NAMESPACE,
				cache: config.cache,
				pluginName: packageName,
				generateImageSource: (source) => source,
				defaultImgixParams: config.defaultImgixParams,
				defaultPlaceholderImgixParams: config.defaultImgixParams,
				imgixClientConfig: config.imgixClientConfig,
			}),
		},
	});
};
