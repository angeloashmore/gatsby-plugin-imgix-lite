import test from "ava";
import * as mswNode from "msw/node";
import * as gatsby from "gatsby";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";
import { buildImageUrl } from "./__testutils__/buildImageURL";
import { buildPluginOptions } from "./__testutils__/buildPluginOptions";
import { getCreatedType } from "./__testutils__/getCreatedType";
import { instantiateImageURL } from "./__testutils__/instantiateImageURL";

import * as libServer from "../src/index.server";
import * as plugin from "../src/plugin/gatsby-node";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

const noop = () => void 0;

test("creates GraphQL fields for config with getURL", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const url = instantiateImageURL(t, { server });
	const userFieldConfig: libServer.FieldConfig<string | null> = {
		nodeType: "Foo",
		fieldName: "bar",
		getURL: (source) => source,
	};
	pluginOptions.fields = [userFieldConfig as libServer.FieldConfig];

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
				[userFieldConfig.fieldName]: {
					type: "ImgixImage",
				},
			},
		},
	});

	const fieldConfig = type.config.fields?.[userFieldConfig.fieldName];
	if (!(typeof fieldConfig === "object" && "resolve" in fieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	t.deepEqual(
		await fieldConfig.resolve?.(url, {}, {}, {} as GraphQLResolveInfo),
		{
			url,
			width: 400,
			height: 200,
		},
	);

	t.deepEqual(
		await fieldConfig.resolve?.(null, {}, {}, {} as GraphQLResolveInfo),
		null,
	);
});

test("creates GraphQL fields for config with getURLs", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const urls = [
		instantiateImageURL(t, { server, index: 0 }),
		instantiateImageURL(t, { server, index: 1 }),
		null,
	];
	const userFieldConfig: libServer.FieldConfig = {
		nodeType: "Foo",
		fieldName: "bar",
		getURLs: () => urls,
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
				[userFieldConfig.fieldName]: {
					type: "[ImgixImage]!",
				},
			},
		},
	});

	const fieldConfig = type.config.fields?.[userFieldConfig.fieldName];
	if (!(typeof fieldConfig === "object" && "resolve" in fieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	t.deepEqual(
		await fieldConfig.resolve?.({}, {}, {}, {} as GraphQLResolveInfo),
		[
			{ url: urls[0], width: 400, height: 200 },
			{ url: urls[1], width: 400, height: 200 },
			null,
		],
	);
});

test("creates GraphQL fields for config with generateImageSource", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const imageSource: libServer.ImageSource = {
		url: buildImageUrl(t),
		width: 400,
		height: 200,
	};
	const userFieldConfig: libServer.FieldConfig<libServer.ImageSource | null> = {
		nodeType: "Foo",
		fieldName: "bar",
		generateImageSource: (source) => source,
	};
	pluginOptions.fields = [userFieldConfig as libServer.FieldConfig];

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
				[userFieldConfig.fieldName]: {
					type: "ImgixImage",
				},
			},
		},
	});

	const fieldConfig = type.config.fields?.[userFieldConfig.fieldName];
	if (!(typeof fieldConfig === "object" && "resolve" in fieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	t.deepEqual(
		await fieldConfig.resolve?.(imageSource, {}, {}, {} as GraphQLResolveInfo),
		imageSource,
	);

	t.deepEqual(
		await fieldConfig.resolve?.(null, {}, {}, {} as GraphQLResolveInfo),
		null,
	);
});

test("creates GraphQL fields for config with generateImageSources", async (t) => {
	const gatsbyContext =
		buildGatsbyContext() as gatsby.CreateSchemaCustomizationArgs;
	const pluginOptions = buildPluginOptions();

	const imageSources = [
		{
			url: buildImageUrl(t, 0),
			width: 400,
			height: 200,
		},
		{
			url: buildImageUrl(t, 1),
			width: 400,
			height: 200,
		},
		null,
	];
	const userFieldConfig: libServer.FieldConfig = {
		nodeType: "Foo",
		fieldName: "bar",
		generateImageSources: () => imageSources,
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
				[userFieldConfig.fieldName]: {
					type: "[ImgixImage]!",
				},
			},
		},
	});

	const fieldConfig = type.config.fields?.[userFieldConfig.fieldName];
	if (!(typeof fieldConfig === "object" && "resolve" in fieldConfig)) {
		t.fail("Field resolver is not present");
		throw new Error();
	}

	t.deepEqual(
		await fieldConfig.resolve?.({}, {}, {}, {} as GraphQLResolveInfo),
		imageSources,
	);
});
