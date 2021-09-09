import * as gatsby from "gatsby";
import * as sinon from "sinon";

export const buildGatsbyContext = (): gatsby.NodePluginArgs => {
	return {
		actions: {
			createTypes: sinon.stub(),
		},
		schema: {
			buildObjectType: sinon
				.stub()
				.callsFake((config) => ({ kind: "OBJECT", config })),
			buildInputObjectType: sinon
				.stub()
				.callsFake((config) => ({ kind: "INPUT_OBJECT", config })),
			buildEnumType: sinon
				.stub()
				.callsFake((config) => ({ kind: "ENUM", config })),
		},
		cache: new Map(),
	};
};
