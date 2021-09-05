import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";
import type { FixedObject } from "gatsby-image";

import { fetchBase64Image } from "../lib/fetchBase64Image.server";

import { GraphQLTypeName } from "../constants";

export type BuildFixedObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
	cache: GatsbyCache;
};

export const buildFixedObjectType = (
	config: BuildFixedObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: config.namespace + GraphQLTypeName.FixedObject,
		fields: {
			base64: {
				type: "String!",
				resolve: async (source: FixedObject) => {
					if (source.base64 != null) {
						return await fetchBase64Image({
							url: source.base64,
							cache: config.cache,
						});
					}
				},
			},
			src: "String!",
			srcSet: "String!",
			srcWebp: "String!",
			srcSetWebp: "String!",
			sizes: "String!",
			width: "Int!",
			height: "Int!",
		},
	});
};
