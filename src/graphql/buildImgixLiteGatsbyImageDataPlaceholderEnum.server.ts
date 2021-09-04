import type { NodePluginSchema, GatsbyGraphQLEnumType } from "gatsby";

import { GatsbyImageDataPlaceholderKind, GraphQLTypeName } from "../types";

type BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig = {
	namespace: string;
	schema: NodePluginSchema;
};

export const buildImgixLiteGatsbyImageDataPlaceholderEnum = (
	config: BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig,
): GatsbyGraphQLEnumType => {
	return config.schema.buildEnumType({
		name: config.namespace + GraphQLTypeName.FixedObject,
		values: {
			BLURRED: {
				value: GatsbyImageDataPlaceholderKind.Blurred,
			},
			DOMINANT_COLOR: {
				value: GatsbyImageDataPlaceholderKind.DominantColor,
			},
			NONE: {
				value: GatsbyImageDataPlaceholderKind.None,
			},
		},
	});
};
