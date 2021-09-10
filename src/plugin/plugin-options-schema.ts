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
		domain: Joi.string().when("sourceType", {
			is: SourceType.WebProxy,
			then: Joi.string().required().messages({
				"any.required":
					'"domain" is required to route images through Imgix when using a Web Proxy source.',
			}),
		}),
		secureURLToken: Joi.string().when("sourceType", {
			is: SourceType.WebProxy,
			then: Joi.string().required().messages({
				"any.required":
					'"secureURLToken" is required to sign Imgix URLs when using a Web Proxy source.',
			}),
		}),
		defaultImgixParams: Joi.object()
			.pattern(Joi.string(), Joi.string())
			.default({}),
		fields: Joi.array()
			.items(
				Joi.object({
					nodeType: Joi.string().required(),
					fieldName: Joi.string().required(),
					generateImageSource: Joi.function(),
					generateImageSources: Joi.function(),
					getURL: Joi.function(),
					getURLs: Joi.function(),
				})
					.xor(
						"generateImageSource",
						"generateImageSources",
						"getURL",
						"getURLs",
					)
					.messages({
						"object.xor":
							"Fields must only contain one of the following: getURL, getURLs, generateImageSource, generateImageSources",
					}),
			)
			.default([]),
		disableIxlibParam: Joi.boolean().default(false),
	});
};
