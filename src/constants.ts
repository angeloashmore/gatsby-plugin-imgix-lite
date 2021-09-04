import { ImgixLiteUrlParams } from "./types";

export const DEFAULT_FIXED_WIDTH = 400;

export const DEFAULT_FLUID_MAX_WIDTH = 800;

export const DEFAULT_FLUID_SRC_SET_BREAKPOINT_FACTORS = [0.25, 0.5, 1.5, 2];

export const DEFAULT_IMGIX_PARAMS: ImgixLiteUrlParams = {
	fit: "crop",
};

export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS: ImgixLiteUrlParams = {
	w: 20,
	blur: 15,
	q: 20,
};
