import test from "ava";
import {
	Joi,
	testPluginOptionsSchema,
	validateOptionsSchema,
} from "gatsby-plugin-utils";

import * as plugin from "../src/plugin/gatsby-node";

test("passes on valid options", async (t) => {
	const res = await testPluginOptionsSchema(plugin.pluginOptionsSchema, {});

	t.deepEqual(res.errors, []);
	t.true(res.isValid);
});

test("populates default options", async (t) => {
	const schema = plugin.pluginOptionsSchema({ Joi });
	const actual = await validateOptionsSchema(schema, {});

	t.deepEqual(actual, {
		defaultImgixParams: {},
		disableIxlibParam: false,
		fields: [],
	});
});

test("fails on invalid options", async (t) => {
	const res = await testPluginOptionsSchema(plugin.pluginOptionsSchema, {
		sourceType: Symbol(),
		domain: Symbol(),
		secureURLToken: Symbol(),
		defaultImgixParams: Symbol(),
		fields: Symbol(),
		disableIxlibParam: Symbol(),
	});

	t.deepEqual(res.errors, [
		'"sourceType" must be a string',
		'"domain" must be a string',
		'"secureURLToken" must be a string',
		'"defaultImgixParams" must be of type object',
		'"fields" must be an array',
		'"disableIxlibParam" must be a boolean',
	]);
	t.false(res.isValid);
});

test("domain and secureURLToken are required if sourceType is `webProxy`", async (t) => {
	const res = await testPluginOptionsSchema(plugin.pluginOptionsSchema, {
		sourceType: "webProxy",
	});

	t.deepEqual(res.errors, [
		'"domain" is required to route images through Imgix when using a Web Proxy source.',
		'"secureURLToken" is required to sign Imgix URLs when using a Web Proxy source.',
	]);
	t.false(res.isValid);
});

test("fields can only contain one source fetcher", async (t) => {
	const res = await testPluginOptionsSchema(plugin.pluginOptionsSchema, {
		fields: [
			{
				nodeType: "Node",
				fieldName: "image",
				getURL: () => void 0,
				getURLs: () => void 0,
				generateImageSource: () => void 0,
				generateImageSources: () => void 0,
			},
		],
	});

	t.deepEqual(res.errors, [
		"Fields must only contain one of the following: getURL, getURLs, generateImageSource, generateImageSources",
	]);
	t.false(res.isValid);
});
