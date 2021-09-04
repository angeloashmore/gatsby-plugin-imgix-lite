import type { NodePluginSchema, GatsbyGraphQLEnumType } from "gatsby";

import {
	ImgixLiteGatsbyImageDataPlaceholderKind,
	ImgixLiteGraphQLTypeName,
} from "../types";

type BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig = {
	namespace: string;
	schema: NodePluginSchema;
};

export const buildImgixLiteGatsbyImageDataPlaceholderEnum = (
	config: BuildImgixLiteGatsbyImageDataPlaceholderEnumConfig,
): GatsbyGraphQLEnumType => {
	return config.schema.buildEnumType({
		name: config.namespace + ImgixLiteGraphQLTypeName.ImageFixedObject,
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
