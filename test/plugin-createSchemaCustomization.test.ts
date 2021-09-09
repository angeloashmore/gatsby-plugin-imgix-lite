import test, { ExecutionContext } from "ava";
import * as sinon from "sinon";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as crypto from "crypto";
import * as gatsby from "gatsby";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";
import { asStub } from "./__testutils__/asStub";

import * as libServer from "../src/index.server";
import * as plugin from "../src/plugin/gatsby-node";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

const noop = () => void 0;
const buildPluginOptions = (): libServer.PluginOptions => {
	return {
		defaultImgixParams: {},
		fields: [],
		disableIxlibParam: false,
		sourceType: libServer.SourceType.AmazonS3,
		plugins: [],
	};
};
const instantiateImageURL = (t: ExecutionContext, index = 0): string => {
	const basename = crypto.createHash("md5").update(t.title).digest("hex");
	const url = `https://example.com/${index}-${basename}.png`;

	server.use(
		msw.rest.get(url, (req, res, ctx) => {
			if (req.url.searchParams.get("fm") === "json") {
				return res.once(ctx.json({ PixelWidth: 400, PixelHeight: 200 }));
			}
		}),
	);

	return url;
};

type GetCreatedTypeConfig = {
	createTypes: gatsby.Actions["createTypes"];
	name: string;
};

const getCreatedType = <T extends gatsby.GatsbyGraphQLType>(
	t: ExecutionContext,
	config: GetCreatedTypeConfig,
): T => {
	const call = asStub(config.createTypes)
		.getCalls()
		.map((call) => call.args[0])
		.find((arg): arg is T => {
			if (typeof arg === "object" && "config" in arg) {
				return arg.config.name === config.name;
			} else {
				return false;
			}
		});

	if (call) {
		return call;
	} else {
		t.fail(`A type with name "${config.name}" was not created.`);

		throw new Error();
	}
};

test("creates base GraphQL types with namespace", (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	plugin.createSchemaCustomization(gatsbyContext, pluginOptions, noop);

	t.true(
		asStub(gatsbyContext.actions.createTypes).calledWith(
			sinon.match({
				kind: "OBJECT",
				config: sinon.match({ name: "ImgixFixed" }),
			}),
		),
		"creates fixed object type",
	);

	t.true(
		asStub(gatsbyContext.actions.createTypes).calledWith(
			sinon.match({
				kind: "OBJECT",
				config: sinon.match({ name: "ImgixFluid" }),
			}),
		),
		"creates fixed object type",
	);

	t.true(
		asStub(gatsbyContext.actions.createTypes).calledWith(
			sinon.match({
				kind: "INPUT_OBJECT",
				config: sinon.match({ name: "ImgixImgixParams" }),
			}),
		),
		"creates Imgix params input object type",
	);

	t.true(
		asStub(gatsbyContext.actions.createTypes).calledWith(
			sinon.match({
				kind: "ENUM",
				config: sinon.match({ name: "ImgixGatsbyImageDataPlaceholder" }),
			}),
		),
		"creates gatsbyImageData placeholder enum type",
	);
});

// TODO: test getURLs, generateImageSource, generateImageSources

test("creates GraphQL field for config with getURL", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const url = instantiateImageURL(t);
	const userFieldConfig: libServer.FieldConfig = {
		nodeType: "Foo",
		fieldName: "bar",
		getURL: () => url,
	};
	pluginOptions.fields = [userFieldConfig];

	plugin.createSchemaCustomization(gatsbyContext, pluginOptions, noop);

	const type = getCreatedType<gatsby.GatsbyGraphQLObjectType>(t, {
		name: userFieldConfig.nodeType,
		createTypes: gatsbyContext.actions.createTypes,
	});

	t.like(type, {
		kind: "OBJECT",
		config: {
			name: userFieldConfig.nodeType,
			fields: {
				bar: {
					type: "ImgixImage",
				},
			},
		},
	});

	const fieldConfig = type.config.fields?.[userFieldConfig.fieldName];
	if (typeof fieldConfig === "object" && "resolve" in fieldConfig) {
		const actual = await fieldConfig.resolve?.(
			{},
			{},
			{},
			{} as GraphQLResolveInfo,
		);

		t.deepEqual(actual, {
			url,
			width: 400,
			height: 200,
		});
	} else {
		t.fail("Field resolver is not present");
	}
});
