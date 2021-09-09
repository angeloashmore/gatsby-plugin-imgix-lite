import test from "ava";
import * as sinon from "sinon";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { asStub } from "./__testutils__/asStub";

import * as libServer from "../src/index.server";

test("returns a namespaced GraphQL field config", (t) => {
	const actual = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => null,
	});

	t.like(actual, {
		type: "String",
		args: {
			imgixParams: { type: "NamespaceImgixParams" },
		},
		resolve: async () => void 0,
	});
});

test("resolves URL using generateImageSource", async (t) => {
	const source = {
		url: "https://example.com/image.png?foo=bar",
		width: 400,
		height: 200,
	};
	const generateImageSource: libServer.GenerateImageSource<typeof source> =
		sinon.stub().callsFake(async (source) => source);
	const fieldConfig = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource,
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		source,
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.true(asStub(generateImageSource).calledWith(source));

	t.is(typeof actual, "string");
});

test("resolves null if image source is null", async (t) => {
	const fieldConfig = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => null,
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.is(actual, null);
});

test("includes default imgix params in Url object", async (t) => {
	const fieldConfig = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => ({
			url: "https://example.com/image.png?foo=bar",
			width: 400,
			height: 200,
		}),
		defaultImgixParams: {
			fpDebug: true,
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual, /&fp-debug=true/);
});

test("includes args imgix params in Url object", async (t) => {
	const fieldConfig = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => ({
			url: "https://example.com/image.png?foo=bar",
			width: 400,
			height: 200,
		}),
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{
			imgixParams: {
				fpDebug: true,
			},
		},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual, /&fp-debug=true/);
});

test("uses imgix client config if provided", async (t) => {
	const fieldConfig = libServer.buildUrlFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => ({
			url: "https://example.com/image.png?foo=bar",
			width: 400,
			height: 200,
		}),
		imgixClientConfig: {
			domain: "foo.com",
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual, /https:\/\/foo.com\//);
});
