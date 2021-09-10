import test from "ava";
import * as sinon from "sinon";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { asStub } from "./__testutils__/asStub";

import * as libServer from "../src/index.server";

test("returns a namespaced GraphQL field config", (t) => {
	const actual = libServer.buildFixedFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => null,
	});

	t.like(actual, {
		type: "NamespaceFixed",
		args: {
			width: { type: "Int", defaultValue: 400 },
			height: { type: "Int" },
			imgixParams: { type: "NamespaceImgixParams" },
			placeholderImgixParams: { type: "NamespaceImgixParams" },
		},
		resolve: async () => void 0,
	});

	t.regex(actual.deprecationReason || "", /gatsby-plugin-image/);
});

test("resolves fixed object using generateImageSource", async (t) => {
	const source = {
		url: "https://example.com/image.png?foo=bar",
		width: 400,
		height: 200,
	};
	const generateImageSource: libServer.GenerateImageSource<typeof source> =
		sinon.stub().callsFake(async (source) => source);
	const fieldConfig = libServer.buildFixedFieldConfig({
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

	t.notThrows(() => {
		sinon.assert.match(actual, {
			width: sinon.match.number,
			height: sinon.match.number,
			base64: sinon.match.string,
			src: sinon.match.string,
			srcWebp: sinon.match.string,
			srcSet: sinon.match.string,
			srcSetWebp: sinon.match.string,
		});
	});
});

test("resolves null if image source is null", async (t) => {
	const fieldConfig = libServer.buildFixedFieldConfig({
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

test("includes default imgix params in fixed object", async (t) => {
	const fieldConfig = libServer.buildFixedFieldConfig({
		namespace: "Namespace",
		generateImageSource: () => ({
			url: "https://example.com/image.png?foo=bar",
			width: 400,
			height: 200,
		}),
		defaultImgixParams: {
			fpDebug: true,
		},
		defaultPlaceholderImgixParams: {
			fpDebug: false,
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual.base64, /&fp-debug=false/);
	t.regex(actual.src, /&fp-debug=true/);
	t.regex(actual.srcWebp, /&fp-debug=true/);
	t.regex(actual.srcSet, /&fp-debug=true/);
	t.regex(actual.srcSetWebp, /&fp-debug=true/);
});

test("includes args imgix params in fixed object", async (t) => {
	const fieldConfig = libServer.buildFixedFieldConfig({
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
			placeholderImgixParams: {
				fpDebug: false,
			},
		},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual.base64, /&fp-debug=false/);
	t.regex(actual.src, /&fp-debug=true/);
	t.regex(actual.srcWebp, /&fp-debug=true/);
	t.regex(actual.srcSet, /&fp-debug=true/);
	t.regex(actual.srcSetWebp, /&fp-debug=true/);
});

test("uses imgix client config if provided", async (t) => {
	const fieldConfig = libServer.buildFixedFieldConfig({
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

	t.regex(actual.base64, /https:\/\/foo.com\//);
	t.regex(actual.src, /https:\/\/foo.com\//);
	t.regex(actual.srcWebp, /https:\/\/foo.com\//);
	t.regex(actual.srcSet, /https:\/\/foo.com\//);
	t.regex(actual.srcSetWebp, /https:\/\/foo.com\//);
});
