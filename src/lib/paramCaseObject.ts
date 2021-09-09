import { paramCase } from "param-case";
import { KebabCase as ParamCase } from "type-fest";

type ParamCaseObject<T extends Record<string, unknown>> = {
	[P in keyof T as ParamCase<P>]: T[P];
};

export const paramCaseObject = <T extends Record<string, unknown>>(
	obj: T,
): ParamCaseObject<T> => {
	const result = {} as ParamCaseObject<T>;

	for (const key in obj) {
		const paramKey = paramCase(key) as keyof typeof result;

		result[paramKey] = obj[key as keyof typeof obj];
	}

	return result;
};
