import test from "ava";
import { parameters as imgixParamSpecs } from "imgix-url-params/dist/parameters.json";
import { camelCase } from "camel-case";

import { buildGatsbyContext } from "./__testutils__/buildGatsbyContext";

import * as libServer from "../src/index.server";

test("returns a namespaced GraphQL input object config", (t) => {
	const gatsbyContext = buildGatsbyContext();
	const actual = libServer.buildImgixParamsInputObjectType({
		namespace: "Namespace",
		schema: gatsbyContext.schema,
	});

	const paramKeys = new Set();
	for (const paramKey in imgixParamSpecs) {
		paramKeys.add(camelCase(paramKey));

		const paramSpec = imgixParamSpecs[paramKey as keyof typeof imgixParamSpecs];
		if ("aliases" in paramSpec) {
			for (const alias of paramSpec.aliases) {
				paramKeys.add(camelCase(alias));
			}
		}
	}

	t.like(actual, {
		kind: "INPUT_OBJECT",
		config: {
			name: "NamespaceImgixParams",
		},
	});
	t.deepEqual(new Set(Object.keys(actual.config.fields)), paramKeys);

	t.snapshot(actual.config.fields);
});
