import * as libServer from "../../src/index.server";

export const buildPluginOptions = (): libServer.PluginOptions => {
	return {
		defaultImgixParams: {},
		fields: [],
		disableIxlibParam: false,
		sourceType: libServer.SourceType.AmazonS3,
		plugins: [],
	};
};
