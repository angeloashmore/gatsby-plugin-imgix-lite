import test, { ExecutionContext } from "ava";
import ImgixClient from "@imgix/js-core";

import * as lib from "../src";

type BuildFluidImageDataTestMacroConfig = {
	url?: string;
	imgixParams: lib.ImgixParams & { ar: string };
	options?: lib.BuildFluidObjectTypeConfig;
	expected: {
		aspectRatio: number;
		imgixParams: lib.ImgixParams;
		placeholderImgixParams: lib.ImgixParams;
	};
};

const macro = (
	t: ExecutionContext,
	config: BuildFluidImageDataTestMacroConfig,
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

	const actual = lib.buildFluidImageData(
		imageSource.url,
		config.imgixParams,
		config.options,
	);

	t.deepEqual(actual, {
		aspectRatio: config.expected.aspectRatio,
		base64: client.buildURL(url.pathname, placeholderImgixParams),
		src: client.buildURL(url.pathname, imgixParams),
		srcWebp: client.buildURL(url.pathname, imgixParamsWebp),
		srcSet: client.buildSrcSet(url.pathname, imgixParams),
		srcSetWebp: client.buildSrcSet(url.pathname, imgixParamsWebp),
		sizes: config.options?.sizes ?? "(min-width: 8192px) 8192px 100vw",
	});
};

test("resolves to a fluid object with a set aspect ratio", macro, {
	imgixParams: {
		ar: "2:1",
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			ar: "2:1",
			w: 800,
		},
		placeholderImgixParams: {
			ar: "2:1",
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});

test("includes provided imgix params", macro, {
	imgixParams: {
		ar: "2:1",
		sat: 100,
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			ar: "2:1",
			sat: 100,
			w: 800,
		},
		placeholderImgixParams: {
			ar: "2:1",
			sat: 100,
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});

test("includes provided sizes", macro, {
	imgixParams: {
		ar: "2:1",
	},
	options: {
		sizes: "50w",
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			ar: "2:1",
			w: 800,
		},
		placeholderImgixParams: {
			ar: "2:1",
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});
