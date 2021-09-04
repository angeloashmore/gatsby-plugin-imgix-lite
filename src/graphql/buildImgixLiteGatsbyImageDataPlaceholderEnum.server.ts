import type { NodePluginSchema, GatsbyGraphQLEnumType } from "gatsby";

import {
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteGraphQLTypeName,
} from "../types";

type BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig = {
	schema: NodePluginSchema;
};

export const buildImgixLiteGatsbyImageDataPlaceholderEnum = (
	config: BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig,
): GatsbyGraphQLEnumType => {
	return config.schema.buildEnumType({
		name: ImgixLiteGraphQLTypeName.GatsbyImageDataPlaceholderEnum,
		values: {
			BLURRED: {
				value: ImgixLiteGatsbyImageDataPlaceholderKind.Blurred,
			},
			DOMINANT_COLOR: {
				value: ImgixLiteGatsbyImageDataPlaceholderKind.DominantColor,
			},
			NONE: {
				value: ImgixLiteGatsbyImageDataPlaceholderKind.None,
			},
		},
	});
};
