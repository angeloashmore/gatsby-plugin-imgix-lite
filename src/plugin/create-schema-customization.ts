import { GatsbyNode, GatsbyCache } from "gatsby";

import { name as pkgName } from "../../package.json";

import {
	GenerateImageSource,
	buildImgixLiteFixedFieldConfig,
	buildImgixLiteFixedObjectType,
	buildImgixLiteFluidFieldConfig,
	buildImgixLiteFluidObjectType,
	buildImgixLiteGatsbyImageDataFieldConfig,
	buildImgixLiteGatsbyImageDataPlaceholderEnum,
	buildImgixLiteUrlFieldConfig,
	buildImgixLiteUrlParamsInputObjectType,
	fetchImageDimensions,
	ImageSource,
} from "../index.server";

import { NAMESPACE } from "./constants";
import { GenerateImageSources, PluginOptions } from "./types";

type GenerateImageSourceFromUrlConfig = {
	cache: GatsbyCache;
};

const generateImageSourceFromUrl = async (
	url: string,
	config: GenerateImageSourceFromUrlConfig,
): Promise<ImageSource | null> => {
	const dimensions = await fetchImageDimensions({
		url,
		cache: config.cache,
	});

	return {
		url,
		width: dimensions.width,
		height: dimensions.height,
	};
};

export const createSchemaCustomization: NonNullable<
	GatsbyNode["createSchemaCustomization"]
> = (args, options: PluginOptions) => {
	const { actions, cache, schema } = args;
	const { createTypes } = actions;

	const imageImgixObjectType = schema.buildObjectType({
		name: "ImgixImage",
		fields: {
			url: buildImgixLiteUrlFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
			}),
			fixed: buildImgixLiteFixedFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: options.defaultImgixParams,
				defaultPlaceholderImgixParams: options.defaultImgixParams,
			}),
			fluid: buildImgixLiteFluidFieldConfig({
				namespace: NAMESPACE,
				generateImageSource: (source) => source,
				defaultImgixParams: options.defaultImgixParams,
				defaultPlaceholderImgixParams: options.defaultImgixParams,
			}),
			gatsbyImageData: buildImgixLiteGatsbyImageDataFieldConfig({
				namespace: NAMESPACE,
				cache,
				pluginName: pkgName,
				generateImageSource: (source) => source,
				defaultImgixParams: options.defaultImgixParams,
				defaultPlaceholderImgixParams: options.defaultImgixParams,
			}),
		},
	});

	const baseImgixTypes = [
		buildImgixLiteFixedObjectType({
			namespace: NAMESPACE,
			cache,
			schema,
		}),
		buildImgixLiteFluidObjectType({
			namespace: NAMESPACE,
			cache,
			schema,
		}),
		buildImgixLiteUrlParamsInputObjectType({
			namespace: NAMESPACE,
			schema,
		}),
		buildImgixLiteGatsbyImageDataPlaceholderEnum({
			namespace: NAMESPACE,
			schema,
		}),
		imageImgixObjectType,
	];

	const userImgixImageFieldTypes = options.fields.map((fieldConfig) => {
		let isList = false;
		let sourceGenerator:
			| GenerateImageSource<unknown>
			| GenerateImageSources<unknown>;

		if ("generateImageSource" in fieldConfig) {
			sourceGenerator = fieldConfig.generateImageSource;
		} else if ("generateImageSources" in fieldConfig) {
			isList = true;
			sourceGenerator = fieldConfig.generateImageSources;
		} else if ("getURL" in fieldConfig) {
			sourceGenerator = async (source) => {
				const url = await fieldConfig.getURL(source);

				if (url !== null) {
					return await generateImageSourceFromUrl(url, { cache });
				} else {
					return null;
				}
			};
		} else if ("getURLs" in fieldConfig) {
			isList = true;
			sourceGenerator = async (source) => {
				const urls = await fieldConfig.getURLs(source);

				return await Promise.all(
					urls.map(async (url) => {
						if (url !== null) {
							return await generateImageSourceFromUrl(url, { cache });
						} else {
							return null;
						}
					}),
				);
			};
		}

		return schema.buildObjectType({
			name: fieldConfig.nodeType,
			fields: {
				[fieldConfig.fieldName]: {
					type: isList
						? `[${imageImgixObjectType.config.name}]`
						: imageImgixObjectType.config.name,
					resolve: async (source: unknown) => {
						return await sourceGenerator(source);
					},
				},
			},
		});
	});

	createTypes(baseImgixTypes);
	createTypes(userImgixImageFieldTypes);
};
