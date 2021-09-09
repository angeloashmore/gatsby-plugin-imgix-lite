import test from "ava";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";

import * as libServer from "../src/index.server";

test("returns a namespaced GraphQL enum type", (t) => {
	const gatsbyContext = buildGatsbyContext();

	const actual = libServer.buildGatsbyImageDataPlaceholderEnum({
		namespace: "Namespace",
		schema: gatsbyContext.schema,
	});

	t.like(actual, {
		kind: "ENUM",
		config: {
			name: "NamespaceGatsbyImageDataPlaceholder",
			values: {
				BLURRED: { value: "blurred" },
				DOMINANT_COLOR: { value: "dominantColor" },
				NONE: { value: "none" },
			},
		},
	});
});
