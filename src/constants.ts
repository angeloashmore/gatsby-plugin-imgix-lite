import { ImgixParams } from "./types";

/**
 * The default width for fixed images.
 */
export const DEFAULT_FIXED_WIDTH = 400;

/**
 * The default max width for fluid images.
 */
export const DEFAULT_FLUID_MAX_WIDTH = 800;

/**
 * A set of factors used to compute a default setSetBreakpoint argument for fluid images.
 */
export const DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS = [0.25, 0.5, 1.5, 2];

/**
 * Default Imgix parameters applied to all images.
 */
export const DEFAULT_IMGIX_PARAMS: ImgixParams = {
	fit: "crop",
};

/**
 * Default Imgix parameters applied to all placeholder images.
 */
export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS: ImgixParams = {
	w: 20,
	h: undefined,
	blur: 15,
	q: 20,
};

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
	ImgixParamsInputObject = "ImgixParams",

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
 * Gatsby Image layout kinds.
 *
 * @see Gatsby Image plugin documentation: {@link https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#layout}
 */
export enum GatsbyImageDataLayoutKind {
	Constrained = "constrained",
	Fixed = "fixed",
	FullWidth = "fullWidth",
}
