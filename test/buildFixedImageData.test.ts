import test, { ExecutionContext } from "ava";
import ImgixClient from "@imgix/js-core";

import * as lib from "../src";

type BuildFixedImageDataTestMacroConfig = {
	url?: string;
	imgixParams: lib.ImgixParams & { w: number; h: number };
	options?: lib.BuildFixedObjectTypeConfig;
	expected: {
		width: number;
		height: number;
		imgixParams: lib.ImgixParams;
		placeholderImgixParams: lib.ImgixParams;
	};
};

const macro = (
	t: ExecutionContext,
	config: BuildFixedImageDataTestMacroConfig,
) => {
	const url = new URL(config.url ?? "https://example.com/image.png?foo=bar");

	const imageSource: lib.ImageSource = {
		url: url.toString(),
		width: 200,
		height: 100,
	};

	const client = new ImgixClient({
		domain: url.hostname,
		includeLibraryParam: config.options?.includeLibraryParam,
	});

	const imgixParams = {
		fit: "crop",
		...config.expected.imgixParams,
	};

	const imgixParamsWebp = {
		...imgixParams,
		fm: "webp",
	};

	const placeholderImgixParams = {
		fit: "crop",
		...config.expected.placeholderImgixParams,
	};

	const actual = lib.buildFixedImageData(
		imageSource.url,
		config.imgixParams,
		config.options,
	);

	t.deepEqual(actual, {
		width: config.expected.width,
		height: config.expected.height,
		base64: client.buildURL(url.pathname, placeholderImgixParams),
		src: client.buildURL(url.pathname, imgixParams),
		srcWebp: client.buildURL(url.pathname, imgixParamsWebp),
		srcSet: client.buildSrcSet(url.pathname, imgixParams),
		srcSetWebp: client.buildSrcSet(url.pathname, imgixParamsWebp),
	});
};

test("resolves to a fixed object with a set width and height", macro, {
	imgixParams: {
		w: 800,
		h: 400,
	},
	expected: {
		width: 800,
		height: 400,
		imgixParams: {
			w: 800,
			h: 400,
		},
		placeholderImgixParams: {
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});

test("includes provided imgix params", macro, {
	imgixParams: {
		w: 800,
		h: 400,
		sat: 100,
	},
	expected: {
		width: 800,
		height: 400,
		imgixParams: {
			w: 800,
			h: 400,
			sat: 100,
		},
		placeholderImgixParams: {
			w: 20,
			sat: 100,
			blur: 15,
			q: 20,
		},
	},
});
