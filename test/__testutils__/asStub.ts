import * as sinon from "sinon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asStub = <F extends (...args: any[]) => any>(
	f: F,
): sinon.SinonStub<Parameters<F>> => {
	return f as unknown as sinon.SinonStub<Parameters<F>>;
};
