import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import * as gqlc from "graphql-compose";
import { FluidObject } from "gatsby-image";
import { Buffer } from "buffer";
import { GraphQLResolveInfo } from "gatsby/graphql";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";

import * as libServer from "../src/index.server";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a namespaced GraphQL object type", (t) => {
	const gatsbyContext = buildGatsbyContext();

	const actual = libServer.buildFluidObjectType({
		namespace: "Namespace",
		schema: gatsbyContext.schema,
		cache: gatsbyContext.cache,
	});

	t.like(actual, {
		kind: "OBJECT",
		config: {
			name: "NamespaceFluid",
			fields: {
				base64: {
					type: "String!",
					resolve: async () => void 0,
				},
				src: { type: "String!" },
				srcSet: { type: "String!" },
				srcWebp: { type: "String!" },
				srcSetWebp: { type: "String!" },
				sizes: { type: "String!" },
				aspectRatio: { type: "Float!" },
			},
		},
	});
});

test("base64 field resolves url to base64 content with cache", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const fluidObjectType = libServer.buildFluidObjectType({
		namespace: "Namespace",
		schema: gatsbyContext.schema,
		cache: gatsbyContext.cache,
	});
	const resolver =
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(
			fluidObjectType.config.fields
				?.base64 as gqlc.ObjectTypeComposerFieldConfigAsObjectDefinition<
				Pick<FluidObject, "base64">,
				unknown
			>
		).resolve!;

	const url = "https://example.com/image.png";
	const contentType = "image/png";
	const buffer = Buffer.from("file contents");

	server.use(
		msw.rest.get(url, (_req, res, ctx) => {
			return res.once(ctx.set("content-type", contentType), ctx.body(buffer));
		}),
	);

	const actual = await resolver(
		{ base64: url },
		{},
		{},
		{} as GraphQLResolveInfo,
	);

	t.is(actual, `data:${contentType};base64,${buffer.toString("base64")}`);

	await t.notThrowsAsync(async () => {
		await resolver({ base64: url }, {}, {}, {} as GraphQLResolveInfo);
	});
});

test("base64 field resolves null if base64 is null", async (t) => {
	const gatsbyContext = buildGatsbyContext();
	const fluidObjectType = libServer.buildFluidObjectType({
		namespace: "Namespace",
		schema: gatsbyContext.schema,
		cache: gatsbyContext.cache,
	});
	const resolver =
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(
			fluidObjectType.config.fields
				?.base64 as gqlc.ObjectTypeComposerFieldConfigAsObjectDefinition<
				null,
				unknown
			>
		).resolve!;

	const actual = await resolver(null, {}, {}, {} as GraphQLResolveInfo);

	t.is(actual, null);
});
