import type ImgixClient from "@imgix/js-core";

/**
 * Imgix parameters used in Imgix's URL API.
 *
 * @see Imgix Image URL API Reference: {@link https://docs.imgix.com/apis/rendering}
 */
export type ImgixParams = Record<string, string | number | boolean>;

/**
 * The minimal data used when querying an image's pallete data using Imgix's API.
 *
 * @see Imgix Color Pallete Extration: {@link https://docs.imgix.com/apis/rendering/color-palette/palette}
 */
export interface ImgixPalleteLike {
	dominant_colors: {
		vibrant: {
			hex: string;
		};
	};
}

/**
 * The minimal data used when querying an image's dimensions using Imgix's API
 * with `fm=json`.
 *
 * @see Imgix Output Format: {@link https://docs.imgix.com/apis/rendering/format/fm#json}
 */
export interface ImgixJSONDimensionsLike {
	PixelWidth: number;
	PixelHeight: number;
}

/**
 * Metadata that defines an image. This data is used to resolve Gatsby image objects.
 */
export interface ImageSource extends ImageSourceDimensions {
	/**
	 * The image's Imgix URL.
	 */
	url: string;
}

/**
 * Dimensions of an image. This data is used to resolve Gatsby image objects.
 */
export interface ImageSourceDimensions {
	/**
	 * The width of the image.
	 */
	width: number;

	/**
	 * The height of the image.
	 */
	height: number;
}

/**
 * A function that converts an object from your data into image metadata used by
 * the Gatsby image resolvers.
 *
 * @example
 *
 * ```ts
 * interface ImageData {
 * 	url?: string;
 * 	dimensions?: {
 * 		width: number;
 * 		height: number;
 * 	};
 * }
 *
 * const generateImageSource = (source: ImageData) =>
 * 	source.url
 * 		? {
 * 				url: source.url,
 * 				width: source.dimensions.width,
 * 				height: source.dimensions.height,
 * 		  }
 * 		: null;
 * ```
 *
 * @param source - The source data containing the image's Imgix URL.
 *
 * @returns Metadata used by the Gatsby image resolvers. If the source does not
 *   contain an image, return `null` to mark the image as absent.
 */
export type GenerateImageSource<TSource> = (
	source: TSource,
) => ImageSource | null | Promise<ImageSource | null>;

export type ImgixClientConfig = ConstructorParameters<typeof ImgixClient>[0];
