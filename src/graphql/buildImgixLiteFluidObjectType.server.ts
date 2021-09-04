import type {
	NodePluginSchema,
	GatsbyCache,
	GatsbyGraphQLObjectType,
} from "gatsby";
import type { FluidObject } from "gatsby-image";

import { ImgixLiteGraphQLTypeName } from "../types";
import { fetchBase64Image } from "../lib/fetchBase64Image.server";

type BuildImgixLiteFluidObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
	cache: GatsbyCache;
};

export const buildImgixLiteFluidObjectType = (
	config: BuildImgixLiteFluidObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: config.namespace + ImgixLiteGraphQLTypeName.ImageFluidObject,
		fields: {
			base64: {
				type: "String!",
				resolve: async (source: FluidObject) => {
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
			aspectRatio: "Float!",
		},
	});
};
