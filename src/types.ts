/**
 * GraphQL type names used for GraphQL type and field builders.
 */
export enum GraphQLTypeName {
	/**
	 * Gatsby Image placeholder kinds.
	 */
	GatsbyImageDataPlaceholderEnum = "GatsbyImageDataPlaceholder",

	/**
	 * Imgix parameters used in Imgix's URL API.
	 */
	ImgixParamsInputObject = "ImgixParamsInputObject",

	/**
	 * `gatsby-plugin-image` gatsbyImageData objects.
	 */
	GatsbyImageDataObject = "GatsbyImageData",

	/**
	 * `gatsby-image` fixed objects.
	 */
	FixedObject = "Fixed",

	/**
	 * `gatsby-image` fluid objects.
	 */
	FluidObject = "Fluid",
}

/**
 * Gatsby Image placeholder kinds.
 *
 * @see Gatsby Image plugin documentation: {@link https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#placeholder}
 */
export enum GatsbyImageDataPlaceholderKind {
	Blurred = "blurred",
	DominantColor = "dominantColor",
	None = "none",
}

/**
 * Imgix parameters used in Imgix's URL API.
 *
 * @see Imgix Image URL API Reference: {@link https://docs.imgix.com/apis/rendering}
 */
export type ImgixParams = Record<string, string | number>;

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
 * Metadata that defines an image. This data is used to resolve Gatsby image objects.
 */
export interface ImageSource {
	/**
	 * The image's Imgix URL.
	 */
	url: string;

	/**
	 * The width of the image.
	 *
	 * If the dimensions of the image are unknown, use Imgix's JSON format to
	 * fetch image metadata.
	 *
	 * @see Imgix Output Format: {@link https://docs.imgix.com/apis/rendering/format/fm#json}
	 */
	width: number;

	/**
	 * The height of the image.
	 *
	 * If the dimensions of the image are unknown, use Imgix's JSON format to
	 * fetch image metadata.
	 *
	 * @see Imgix Output Format: {@link https://docs.imgix.com/apis/rendering/format/fm#json}
	 */
	height: number;
}

/**
 * A function that converts an image object from your data into an object used
 * by the Gatsby image resolvers.
 *
 * This function will be provided to the GraphQL field config builders to create
 * a Gatsby image resolver using your image data.
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
) => ImageSource | null;
