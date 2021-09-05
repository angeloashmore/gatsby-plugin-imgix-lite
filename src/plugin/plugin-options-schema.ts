import { GatsbyNode } from "gatsby";

import { SourceType } from "./constants";

export const pluginOptionsSchema: NonNullable<
	GatsbyNode["pluginOptionsSchema"]
> = (args) => {
	const { Joi } = args;

	const sourceTypes = Object.values(SourceType).filter(
		(x) => typeof x === "string",
	);

	return Joi.object({
		sourceType: Joi.string().allow(...sourceTypes),
		defaultImgixParams: Joi.object()
			.pattern(Joi.string(), Joi.string())
			.default({}),
		fields: Joi.array()
			.items(
				Joi.object({
					nodeType: Joi.string().required(),
					fieldName: Joi.string().required(),
					generateImageSource: Joi.function().arity(1),
					generateImageSources: Joi.function().arity(1),
					getURL: Joi.function().arity(1),
					getURLs: Joi.function().arity(1),
				}).xor(
					"generateImageSource",
					"generateImageSources",
					"getURL",
					"getURLs",
				),
			)
			.default([]),
		disableIxlibParam: Joi.boolean().default(false),
	}).when("sourceType", {
		is: SourceType.WebProxy,
		then: Joi.object({
			domain: Joi.string().required(),
			secureURLToken: Joi.string().required(),
		}),
	});
};
