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
	blur: 15,
	q: 20,
};
