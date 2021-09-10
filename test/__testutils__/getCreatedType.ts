import * as ava from "ava";
import * as gatsby from "gatsby";

import { asStub } from "./asStub";

type GetCreatedTypeConfig = {
	createTypes: gatsby.Actions["createTypes"];
	name: string;
};

/**
 * Finds a GraphQL type created via `createTypes` by name.
 *
 * @param t - Test execution context.
 * @param config - Configuration for the function.
 *
 * @returns The created GraphQL type with a matching name.
 * @throws If a type with a matching name cannot be found.
 */
export const getCreatedType = <T extends gatsby.GatsbyGraphQLType>(
	t: ava.ExecutionContext,
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
