import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";

import { name as packageName } from "../../package.json";

import { ImgixParams, ImgixClientConfig } from "../index";
import {
	buildUrlFieldConfig,
	buildFixedFieldConfig,
	buildFluidFieldConfig,
	buildGatsbyImageDataFieldConfig,
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
			url: buildUrlFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			fixed: buildFixedFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: config.defaultImgixParams,
				defaultPlaceholderImgixParams: config.defaultImgixParams,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			fluid: buildFluidFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: config.defaultImgixParams,
				defaultPlaceholderImgixParams: config.defaultImgixParams,
				imgixClientConfig: config.imgixClientConfig,
			}),
			// @ts-expect-error - complex type resolution issue
			gatsbyImageData: buildGatsbyImageDataFieldConfig({
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
