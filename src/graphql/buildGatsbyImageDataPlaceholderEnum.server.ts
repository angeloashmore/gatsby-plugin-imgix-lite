import type { NodePluginSchema, GatsbyGraphQLEnumType } from "gatsby";

import { GatsbyImageDataPlaceholderKind, GraphQLTypeName } from "../constants";

export type BuildGatsbyImageDataPlaceholderEnumConfig = {
	namespace: string;
	schema: NodePluginSchema;
};

export const buildGatsbyImageDataPlaceholderEnum = (
	config: BuildGatsbyImageDataPlaceholderEnumConfig,
): GatsbyGraphQLEnumType => {
	return config.schema.buildEnumType({
		name: config.namespace + GraphQLTypeName.GatsbyImageDataPlaceholderEnum,
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
