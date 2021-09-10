import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as sinon from "sinon";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { asStub } from "./__testutils__/asStub";

import * as libServer from "../src/index.server";
import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a namespaced GraphQL field config", (t) => {
	const gatsbyContext = buildGatsbyContext();
	const actual = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
		generateImageSource: () => null,
	});

	t.like(actual, {
		type: "JSON",
		args: {
			placeholder: { type: "NamespaceGatsbyImageDataPlaceholder" },
			imgixParams: { type: "NamespaceImgixParams" },
			placeholderImgixParams: { type: "NamespaceImgixParams" },
		},
		resolve: async () => void 0,
	});
});

test("resolves fixed object using generateImageSource", async (t) => {
	const source = {
		url: "https://example.com/image.png?foo=bar",
		width: 400,
		height: 200,
	};
	const generateImageSource: libServer.GenerateImageSource<typeof source> =
		sinon.stub().callsFake(async (source) => source);
	const gatsbyContext = buildGatsbyContext();
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
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
			images: {
				sources: [
					{
						sizes: sinon.match.string,
						srcSet: sinon.match.string,
						type: sinon.match.string,
					},
				],
			},
			layout: sinon.match.string,
			backgroundColor: undefined,
			width: sinon.match.number,
			height: sinon.match.number,
		});
	});
});

test("resolves null if image source is null", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
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
	const gatsbyContext = buildGatsbyContext();
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
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

	t.regex(actual.images.sources[0].srcSet, /&fp-debug=true/);
});

test("includes arg imgix params in fixed object", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
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

	t.regex(actual.images.sources[0].srcSet, /&fp-debug=true/);
});

test("uses imgix client config if provided", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
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

	t.regex(actual.images.sources[0].srcSet, /https:\/\/foo.com\//);
});

test("builds blurred placeholder if requested", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const url = "https://example.com/blurredTest.png";
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
		generateImageSource: () => ({
			url,
			width: 400,
			height: 200,
		}),
	});

	const contentType = "image/png";
	const buffer = Buffer.from("file contents");

	server.use(
		msw.rest.get(url, (req, res, ctx) => {
			if (req.url.searchParams.get("w") === "20") {
				return res.once(ctx.set("content-type", contentType), ctx.body(buffer));
			} else {
				t.fail(
					"The correct low resolution placeholder image URL was not requested",
				);
			}
		}),
	);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{ placeholder: libServer.GatsbyImageDataPlaceholderKind.Blurred },
		{},
		{} as GraphQLResolveInfo,
	);

	t.is(
		actual.placeholder.fallback,
		`data:${contentType};base64,${buffer.toString("base64")}`,
	);
	t.notThrows(() => {
		sinon.assert.match(actual, {
			images: {
				fallback: {
					sizes: sinon.match.string,
					src: sinon.match.string,
					srcSet: sinon.match.string,
				},
			},
		});
	});
});

test("builds dominant color placeholder if requested", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const url = "https://example.com/dominantColorTest.png";
	const fieldConfig = libServer.buildGatsbyImageDataFieldConfig({
		namespace: "Namespace",
		pluginName: "plugin-name",
		cache: gatsbyContext.cache,
		generateImageSource: () => ({
			url,
			width: 400,
			height: 200,
		}),
	});

	const dominantColor = "#ff00ff";

	server.use(
		msw.rest.get(url, (req, res, ctx) => {
			if (req.url.searchParams.get("palette") === "json") {
				return res.once(
					ctx.json({ dominant_colors: { vibrant: { hex: dominantColor } } }),
				);
			} else {
				t.fail("The correct dominant color placeholder URL was not requested");
			}
		}),
	);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const actual = await fieldConfig.resolve!(
		{},
		{ placeholder: libServer.GatsbyImageDataPlaceholderKind.DominantColor },
		{},
		{} as GraphQLResolveInfo,
	);

	t.is(actual.backgroundColor, dominantColor);
	t.notThrows(() => {
		sinon.assert.match(actual, {
			images: {
				fallback: {
					sizes: sinon.match.string,
					src: sinon.match.string,
					srcSet: sinon.match.string,
				},
			},
		});
	});
});
