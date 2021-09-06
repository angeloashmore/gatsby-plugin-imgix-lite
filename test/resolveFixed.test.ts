import test, { ExecutionContext } from "ava";
import ImgixClient from "@imgix/js-core";

import * as lib from "../src";

type FixedTestMacroConfig = {
	url?: string;
	options?: lib.FixedArgs;
	expected: {
		width: number;
		height: number;
		imgixParams: lib.ImgixParams;
		placeholderImgixParams: lib.ImgixParams;
	};
};

const macro = (t: ExecutionContext, config: FixedTestMacroConfig) => {
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

	const actual = lib.resolveFixed(imageSource, config.options);

	t.like(actual, {
		width: config.expected.width,
		height: config.expected.height,
		base64: client.buildURL(url.pathname, placeholderImgixParams),
		src: client.buildURL(url.pathname, imgixParams),
		srcWebp: client.buildURL(url.pathname, imgixParamsWebp),
		srcSet: client.buildSrcSet(url.pathname, imgixParams),
		srcSetWebp: client.buildSrcSet(url.pathname, imgixParamsWebp),
	});
};

test("resolves to a fixed object with default options", macro, {
	expected: {
		width: 400,
		height: 200,
		imgixParams: {
			w: 400,
			h: 200,
		},
		placeholderImgixParams: {
			w: 20,
			blur: 15,
			q: 20,
		},
	},
});

test("resolves to a fixed object with set width", macro, {
	options: {
		width: 800,
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

// TODO: The width needs to be calculated from the given height.
test.skip("resolves to a fixed object with set height", macro, {
	options: {
		height: 400,
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

test("treats a null height option as undefined", macro, {
	options: {
		height: null,
	},
	expected: {
		width: 400,
		height: 200,
		imgixParams: {
			w: 400,
			h: 200,
		},
		placeholderImgixParams: {
			w: 20,
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
		width: 400,
		height: 200,
		imgixParams: {
			sat: 100,
			w: 400,
			h: 200,
		},
		placeholderImgixParams: {
			sat: 100,
			w: 20,
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
		width: 400,
		height: 100,
		imgixParams: {
			ar: "4:1",
			w: 400,
			h: 100,
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
			width: 400,
			height: 200,
			imgixParams: {
				ar: "invalid",
				w: 400,
				h: 200,
			},
			placeholderImgixParams: {
				ar: "invalid",
				w: 20,
				blur: 15,
				q: 20,
			},
		},
	},
);
