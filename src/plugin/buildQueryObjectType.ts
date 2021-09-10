import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";

import { ImageSource } from "../index";
import { generateImageSourceFromUrl } from "../index.server";

import { GraphQLTypeName } from "./constants";

type ImgixImageArgs = {
	url: string | null;
	width: number | null;
	height: number | null;
};

type BuildQueryObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
	cache: GatsbyCache;
};

export const buildQueryObjectType = (
	config: BuildQueryObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: "Query",
		fields: {
			imgixImage: {
				type: config.namespace + GraphQLTypeName.Image,
				args: {
					url: { type: "String" },
					width: { type: "Int" },
					height: { type: "Int" },
				},
				resolve: async (
					_source: void,
					args: ImgixImageArgs,
				): Promise<ImageSource | null> => {
					const url = args.url;

					if (url != null) {
						if (args.width != null && args.height != null) {
							return {
								url,
								width: args.width,
								height: args.height,
							};
						} else {
							return await generateImageSourceFromUrl(url, {
								cache: config.cache,
							});
						}
					} else {
						return null;
					}
				},
			},
		},
	});
};
