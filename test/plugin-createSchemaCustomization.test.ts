import test from "ava";
import * as mswNode from "msw/node";
import * as gatsby from "gatsby";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";
import { buildPluginOptions } from "./__testutils__/buildPluginOptions";
import { getCreatedType } from "./__testutils__/getCreatedType";
import { instantiateImageURL } from "./__testutils__/instantiateImageURL";

import * as plugin from "../src/plugin/gatsby-node";
import * as lib from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

const noop = () => void 0;

test("creates base GraphQL types with namespace", (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	plugin.createSchemaCustomization(gatsbyContext, pluginOptions, noop);

	t.like(
		getCreatedType(t, {
			name: "Query",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{
			kind: "OBJECT",
			config: {
				fields: {
					imgixImage: {
						type: "ImgixImage",
						args: {
							url: { type: "String" },
							width: { type: "Int" },
							height: { type: "Int" },
						},
						resolve: async () => void 0,
					},
				},
			},
		},
		"creates ImgixImage object type",
	);

	t.like(
		getCreatedType(t, {
			name: "ImgixImage",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{
			kind: "OBJECT",
			config: {
				fields: {
					url: { type: "String" },
					fixed: { type: "ImgixFixed" },
					fluid: { type: "ImgixFluid" },
					gatsbyImageData: { type: "JSON" },
				},
			},
		},
		"creates ImgixImage object type",
	);

	t.like(
		getCreatedType(t, {
			name: "ImgixFixed",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{ kind: "OBJECT" },
		"creates fixed object type",
	);

	t.like(
		getCreatedType(t, {
			name: "ImgixFluid",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{ kind: "OBJECT" },
		"creates fluid object type",
	);

	t.like(
		getCreatedType(t, {
			name: "ImgixImgixParams",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{ kind: "INPUT_OBJECT" },
		"creates Imgix params input object type",
	);

	t.like(
		getCreatedType(t, {
			name: "ImgixGatsbyImageDataPlaceholder",
			createTypes: gatsbyContext.actions.createTypes,
		}),
		{ kind: "ENUM" },
		"creates Imgix params input object type",
	);
});

type ImgixImageArgs = {
	url: string | null;
	width: number | null;
	height: number | null;
};

test("imgixImage Query field resolves image source", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const imageSource = {
		url: instantiateImageURL(t, { server }),
		width: 400,
		height: 200,
	};

	plugin.createSchemaCustomization(gatsbyContext, pluginOptions, noop);

	const type = getCreatedType<gatsby.GatsbyGraphQLObjectType>(t, {
		name: "Query",
		createTypes: gatsbyContext.actions.createTypes,
	});

	const fieldConfig = type.config.fields?.imgixImage;
	if (!(typeof fieldConfig === "object" && "resolve" in fieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	const resolveWithArgs = async (
		args: ImgixImageArgs,
	): Promise<lib.ImageSource | null> => {
		return await fieldConfig.resolve?.({}, args, {}, {} as GraphQLResolveInfo);
	};

	t.deepEqual(
		await resolveWithArgs({
			url: null,
			width: null,
			height: null,
		}),
		null,
		"resolves to null if url is not given",
	);

	t.deepEqual(
		await resolveWithArgs({
			url: imageSource.url,
			width: null,
			height: null,
		}),
		imageSource,
		"fetches images dimensions if only url is provided",
	);

	t.deepEqual(
		await resolveWithArgs({
			url: imageSource.url,
			width: null,
			height: null,
		}),
		imageSource,
		"fetches image dimensions if only width is provided",
	);

	t.deepEqual(
		await resolveWithArgs({
			url: imageSource.url,
			width: null,
			height: 100,
		}),
		imageSource,
		"fetches image dimensions if only height is provided",
	);

	t.deepEqual(
		await resolveWithArgs({
			url: imageSource.url,
			width: 200,
			height: 100,
		}),
		{
			url: imageSource.url,
			width: 200,
			height: 100,
		},
		"uses provided width and height if both are provided",
	);
});

test("uses imgix client config if provided", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();
	pluginOptions.domain = "foo.com";
	pluginOptions.secureURLToken = "token";

	const imageSource = {
		url: instantiateImageURL(t, { server }),
		width: 400,
		height: 200,
	};

	plugin.createSchemaCustomization(gatsbyContext, pluginOptions, noop);

	const type = getCreatedType<gatsby.GatsbyGraphQLObjectType>(t, {
		name: "ImgixImage",
		createTypes: gatsbyContext.actions.createTypes,
	});

	const urlFieldConfig = type.config.fields?.url;
	if (!(typeof urlFieldConfig === "object" && "resolve" in urlFieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	const actual = await urlFieldConfig.resolve?.(
		imageSource,
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.regex(actual, /^https:\/\/foo.com\//);
});
