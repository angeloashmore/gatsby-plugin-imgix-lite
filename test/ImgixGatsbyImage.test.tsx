import test from "ava";
import TestRenderer from "react-test-renderer";
import * as React from "react";

import * as lib from "../src";

const ImgixGatsbyImage = lib.ImgixGatsbyImage;
const src = "https://example.com/image.png?foo=bar";
const alt = "alt";

test("renders given image with sourceWidth and sourceHeight", (t) => {
	const testRenderer = TestRenderer.create(
		<ImgixGatsbyImage
			src={src}
			sourceWidth={400}
			sourceHeight={200}
			alt={alt}
		/>,
	);

	const json = testRenderer.toJSON();
	if (!json) {
		t.fail("Renderer did not return an observable result");
		throw new Error();
	} else if (Array.isArray(json)) {
		t.fail("Renderer returned more than the expected one element");
		throw new Error();
	}

	const actual = json.children?.find(
		(child) => typeof child === "object" && child.type === "img",
	);

	const expected = lib.getGatsbyImageData({
		src,
		sourceWidth: 400,
		sourceHeight: 200,
	});

	t.like(typeof actual === "object" && actual.props, {
		sizes: expected.images.fallback?.sizes,
		"data-src": expected.images.fallback?.src,
		"data-srcset": expected.images.fallback?.srcSet?.replace(/\n/g, ""),
	});
});

test("renders given image with width and aspectRatio", (t) => {
	const testRenderer = TestRenderer.create(
		<ImgixGatsbyImage src={src} width={400} aspectRatio={2} alt={alt} />,
	);

	const json = testRenderer.toJSON();
	if (!json) {
		t.fail("Renderer did not return an observable result");
		throw new Error();
	} else if (Array.isArray(json)) {
		t.fail("Renderer returned more than the expected one element");
		throw new Error();
	}

	const actual = json.children?.find(
		(child) => typeof child === "object" && child.type === "img",
	);

	const expected = lib.getGatsbyImageData({
		src,
		width: 400,
		aspectRatio: 2,
	});

	t.like(typeof actual === "object" && actual.props, {
		sizes: expected.images.fallback?.sizes,
		"data-src": expected.images.fallback?.src,
		"data-srcset": expected.images.fallback?.srcSet?.replace(/\n/g, ""),
	});
});
