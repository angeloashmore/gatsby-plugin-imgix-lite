import test, { ExecutionContext } from "ava";
import { getImageData } from "gatsby-plugin-image";
import ImgixClient from "@imgix/js-core";

import { name as packageName } from "../package.json";

import * as lib from "../src";

type GetGatsbyImageDataTestMacroConfig = {
	options: lib.GetGatsbyImageDataConfig;
	expected: {
		sourceWidth: number;
		sourceHeight: number;
		imgixParams: lib.ImgixParams;
	};
};

const src = "https://example.com/image.png?foo=bar";

const macro = (
	t: ExecutionContext,
	config: GetGatsbyImageDataTestMacroConfig,
) => {
	const url = new URL(config.options.src);
	const client = new ImgixClient({
		domain: url.hostname,
	});

	const actual = lib.getGatsbyImageData(config.options);

	t.deepEqual(
		actual,
		getImageData({
			...config.options,
			baseUrl: config.options.src,
			sourceWidth: config.expected.sourceWidth,
			sourceHeight: config.expected.sourceHeight,
			pluginName: packageName,
			urlBuilder: (args) => {
				const imageUrl = new URL(args.baseUrl);

				const imgixParams = {
					fit: "crop",
					...config.expected.imgixParams,
					w: args.width,
					h: args.height,
					fm: args.format,
				};

				return client.buildURL(imageUrl.pathname, imgixParams);
			},
		}),
	);
};

test(
	"resolves to a gatsbyImageData object with source width and height",
	macro,
	{
		options: {
			src,
			sourceWidth: 400,
			sourceHeight: 200,
		},
		expected: {
			sourceWidth: 400,
			sourceHeight: 200,
			imgixParams: {
				w: 400,
				h: 200,
				fm: "auto",
			},
		},
	},
);

test(
	"resolves to a gatsbyImageData object with width and aspect ratio",
	macro,
	{
		options: {
			src,
			width: 800,
			aspectRatio: 2,
		},
		expected: {
			sourceWidth: 800,
			sourceHeight: 400,
			imgixParams: {
				w: 800,
				h: 400,
				fm: "auto",
			},
		},
	},
);

test("resolves to a gatsbyImageData object with set width and height", macro, {
	options: {
		src,
		width: 400,
		height: 100,
		aspectRatio: 2,
	},
	expected: {
		sourceWidth: 400,
		sourceHeight: 200,
		imgixParams: {
			w: 800,
			h: 400,
			fm: "auto",
		},
	},
});

test("includes provided imgix params", macro, {
	options: {
		src,
		sourceWidth: 400,
		sourceHeight: 200,
		imgixParams: {
			sat: 100,
		},
	},
	expected: {
		sourceWidth: 400,
		sourceHeight: 200,
		imgixParams: {
			sat: 100,
			w: 400,
			h: 200,
			fm: "auto",
		},
	},
});
