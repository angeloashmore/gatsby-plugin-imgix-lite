import test, { ExecutionContext } from "ava";
import ImgixClient from "@imgix/js-core";

import * as lib from "../src";
import { resolveFluid, FluidArgs } from "../src/resolvers/resolveFluid";

type FluidTestMacroConfig = {
	url?: string;
	options?: FluidArgs;
	expected: {
		aspectRatio: number;
		imgixParams: lib.ImgixParams;
		placeholderImgixParams: lib.ImgixParams;
	};
};

const macro = (t: ExecutionContext, config: FluidTestMacroConfig) => {
	const url = new URL(config.url ?? "https://example.com/image.png?foo=bar");

	const imageSource: lib.ImageSource = {
		url: url.toString(),
		width: 200,
		height: 100,
	};

	const client = new ImgixClient({
		domain: url.hostname,
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

	const actual = resolveFluid(imageSource, config.options);

	t.deepEqual(actual, {
		aspectRatio: config.expected.aspectRatio,
		base64: client.buildURL(url.pathname, placeholderImgixParams),
		src: client.buildURL(url.pathname, imgixParams),
		srcWebp: client.buildURL(url.pathname, imgixParamsWebp),
		srcSet: client.buildSrcSet(url.pathname, imgixParams),
		srcSetWebp: client.buildSrcSet(url.pathname, imgixParamsWebp),
		sizes: "(min-width: 8192px) 8192px 100vw",
	});
};

test("resolves to a fluid object with default options", macro, {
	expected: {
		aspectRatio: 2,
		imgixParams: {
			w: 800,
			ar: "2:1",
		},
		placeholderImgixParams: {
			w: 20,
			ar: "2:1",
			blur: 15,
			q: 20,
		},
	},
});

test("resolves to a fluid object with set max width", macro, {
	options: {
		maxWidth: 400,
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			w: 400,
			ar: "2:1",
		},
		placeholderImgixParams: {
			w: 20,
			ar: "2:1",
			blur: 15,
			q: 20,
		},
	},
});

test("resolves to a fluid object with set max height", macro, {
	options: {
		maxHeight: 200,
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			w: 400,
			ar: "2:1",
		},
		placeholderImgixParams: {
			w: 20,
			ar: "2:1",
			blur: 15,
			q: 20,
		},
	},
});

test("resolves to a fluid object with set max width and max height", macro, {
	options: {
		maxWidth: 400,
		maxHeight: 100,
	},
	expected: {
		aspectRatio: 4,
		imgixParams: {
			w: 400,
			ar: "4:1",
		},
		placeholderImgixParams: {
			w: 20,
			ar: "4:1",
			blur: 15,
			q: 20,
		},
	},
});

test("includes provided imgix params", macro, {
	options: {
		imgixParams: {
			sat: 100,
		},
	},
	expected: {
		aspectRatio: 2,
		imgixParams: {
			sat: 100,
			w: 800,
			ar: "2:1",
		},
		placeholderImgixParams: {
			sat: 100,
			w: 20,
			ar: "2:1",
			blur: 15,
			q: 20,
		},
	},
});

test("uses the `ar` Imgix parameter as the resolved aspect ratio", macro, {
	options: {
		imgixParams: {
			ar: "4:1",
		},
	},
	expected: {
		aspectRatio: 4,
		imgixParams: {
			ar: "4:1",
			w: 800,
		},
		placeholderImgixParams: {
			ar: "4:1",
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});

test(
	"defaults to the image source aspect ratio if the `ar` Imgix parameter is invalid",
	macro,
	{
		options: {
			imgixParams: {
				ar: "invalid",
			},
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
	},
);
