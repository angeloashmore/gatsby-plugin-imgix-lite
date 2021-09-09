import { GatsbyNode } from "gatsby";

import {
	GenerateImageSource,
	ImgixClientConfig,
	buildFixedObjectType,
	buildFluidObjectType,
	buildGatsbyImageDataPlaceholderEnum,
	buildImgixParamsInputObjectType,
	generateImageSourceFromUrl,
} from "../index.server";

import { NAMESPACE, SourceType } from "./constants";
import { GenerateImageSources, PluginOptions } from "./types";
import { buildImgixImageObjectType } from "./buildImgixImageObjectType";
import { buildQueryObjectType } from "./buildQueryObjectType";

export const createSchemaCustomization: NonNullable<
	GatsbyNode["createSchemaCustomization"]
> = (args, options: PluginOptions) => {
	const { actions, cache, schema } = args;
	const { createTypes } = actions;

	const imgixClientConfig: Partial<ImgixClientConfig> = {
		includeLibraryParam: !options.disableIxlibParam,
	};
	if (options.sourceType === SourceType.WebProxy) {
		imgixClientConfig.domain = options.domain;
		imgixClientConfig.secureURLToken = options.secureURLToken;
	}

	const imgixImageObjectType = buildImgixImageObjectType({
		namespace: NAMESPACE,
		cache,
		schema,
		defaultImgixParams: options.defaultImgixParams,
		defaultPlaceholderImgixParams: options.defaultImgixParams,
		imgixClientConfig,
	});

	const baseImgixTypes = [
		buildFixedObjectType({
			namespace: NAMESPACE,
			cache,
			schema,
		}),
		buildFluidObjectType({
			namespace: NAMESPACE,
			cache,
			schema,
		}),
		buildImgixParamsInputObjectType({
			namespace: NAMESPACE,
			schema,
		}),
		buildGatsbyImageDataPlaceholderEnum({
			namespace: NAMESPACE,
			schema,
		}),
		buildQueryObjectType({
			namespace: NAMESPACE,
			cache,
			schema,
		}),
		imgixImageObjectType,
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
						? `[${imgixImageObjectType.config.name}]`
						: imgixImageObjectType.config.name,
					resolve: async (source: unknown) => {
						return await sourceGenerator(source);
					},
				},
			},
		});
	});

	// Calling `createTypes` one type at a time makes testing easier.
	for (const type of [...baseImgixTypes, ...userImgixImageFieldTypes]) {
		createTypes(type);
	}
};
