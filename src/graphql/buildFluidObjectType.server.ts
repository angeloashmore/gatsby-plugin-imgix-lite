import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";
import type { FluidObject } from "gatsby-image";

import { fetchBase64Image } from "../lib/fetchBase64Image.server";

import { GraphQLTypeName } from "../constants";

export type BuildFluidObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
	cache: GatsbyCache;
};

export const buildFluidObjectType = (
	config: BuildFluidObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: config.namespace + GraphQLTypeName.FluidObject,
		fields: {
			base64: {
				type: "String!",
				resolve: async (source: FluidObject | null) => {
					if (source?.base64 != null) {
						return await fetchBase64Image({
							url: source.base64,
							cache: config.cache,
						});
					} else {
						return null;
					}
				},
			},
			src: { type: "String!" },
			srcSet: { type: "String!" },
			srcWebp: { type: "String!" },
			srcSetWebp: { type: "String!" },
			sizes: { type: "String!" },
			aspectRatio: { type: "Float!" },
		},
	});
};
