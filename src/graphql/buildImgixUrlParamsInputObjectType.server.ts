import type { NodePluginSchema, GatsbyGraphQLInputObjectType } from "gatsby";
import { parameters as imgixParamSpecs } from "imgix-url-params/dist/parameters.json";
import { camelCase } from "camel-case";

import { GraphQLTypeName } from "../constants";

export type BuildImgixUrlParamsInputObjectTypeConfig = {
	namespace: string;
	schema: NodePluginSchema;
};

export const buildImgixUrlParamsInputObjectType = (
	config: BuildImgixUrlParamsInputObjectTypeConfig,
): GatsbyGraphQLInputObjectType => {
	const fields: GatsbyGraphQLInputObjectType["config"]["fields"] = {};

	for (const paramKey in imgixParamSpecs) {
		const paramSpec = imgixParamSpecs[paramKey as keyof typeof imgixParamSpecs];

		const normalizedName = camelCase(paramKey);

		const expects = paramSpec.expects;
		const expectsTypes = Array.from(
			new Set(expects.map((expect) => expect.type)),
		);

		const type = expectsTypes.every(
			(type) => type === "integer" || type === "unit_scalar",
		)
			? "Int"
			: expectsTypes.every(
					(type) =>
						type === "integer" || type === "unit_scalar" || type === "number",
			  )
			? "Float"
			: expectsTypes.every((type) => type === "boolean")
			? "Boolean"
			: "String";

		const fieldDefinition: typeof fields[string] = {
			type,
			description:
				paramSpec.short_description +
				// Ensure the description ends with a period.
				(paramSpec.short_description.slice(-1) === "." ? "" : "."),
		};

		// Add the default value as part of the description. Setting it as a
		// GraphQL default value will automatically assign it in the final URL.
		// Doing so would result in a huge number of unwanted params.
		if ("default" in paramSpec) {
			fieldDefinition.description =
				fieldDefinition.description + ` Default: \`${paramSpec.default}\`.`;
		}

		// Add Imgix documentation URL as part of the description.
		if ("url" in paramSpec) {
			fieldDefinition.description =
				fieldDefinition.description + ` [See docs](${paramSpec.url}).`;
		}

		fields[normalizedName] = fieldDefinition;

		// Create aliased fields.
		if ("aliases" in paramSpec) {
			for (const alias of paramSpec.aliases) {
				fields[camelCase(alias)] = {
					...fieldDefinition,
					description: `Alias for \`${normalizedName}\`.`,
				};
			}
		}
	}

	return config.schema.buildInputObjectType({
		name: config.namespace + GraphQLTypeName.ImgixParamsInputObject,
		fields,
	});
};
