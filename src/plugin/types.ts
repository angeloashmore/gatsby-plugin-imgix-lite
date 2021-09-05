import { PluginOptions as GatsbyPluginOptions } from "gatsby";

import { GenerateImageSource, ImgixParams, ImageSource } from "../index.server";
import { SourceType } from "./constants";

export type PluginOptions = GatsbyPluginOptions & {
	defaultImgixParams: ImgixParams;
	fields: FieldConfig[];
	disableIxlibParam: boolean;
} & (
		| {
				sourceType?: Exclude<SourceType, SourceType.WebProxy>;
		  }
		| {
				sourceType: SourceType.WebProxy;
				domain: string;
				secureURLToken: string;
		  }
	);

/**
 * Configuration used to register Imgix URL generating fields.
 *
 * @typeParam TSource - Source data from which image metadata can be derived.
 */
type FieldConfig<TSource = unknown> = {
	/**
	 * The root GraphQL node type from which image metadata can be derived.
	 */
	nodeType: string;

	/**
	 * The name of the field that will be added to nodes of type `nodeType`.
	 */
	fieldName: string;
} & (
	| {
			/**
			 * A function that converts an object from your data into image metadata
			 * used by the Gatsby image resolvers.
			 *
			 * @remarks
			 * If a list of images should be returned, use the `generateImageSources`
			 * property in place of `generateImageSource` (note the pluralization).
			 */
			generateImageSource: GenerateImageSource<TSource>;
	  }
	| {
			/**
			 * A function that converts an object from your data into a list of image
			 * metadata used by the Gatsby image resolvers.
			 *
			 * @remarks
			 * If a single image should be returned, use the `generateImageSource`
			 * property in place of `generateImageSources` (note the lack of pluralization).
			 */
			generateImageSources: GenerateImageSources<TSource>;
	  }
	| {
			/**
			 * A function that converts an object from your data into an image URL
			 * used by the Gatsby image resolvers.
			 *
			 * @remarks
			 * When using this option, a network request will be made for each URL to
			 * fetch its dimensions (the results will be cached). If your data already
			 * contains the image dimensions, use the `generateImageSource` property
			 * in place of `getURL`.
			 *
			 * If a list of images should be returned, use the `getURLs` property in
			 * place of `getURL` (note the pluralization).
			 * @see {@link GenerateImageSource}
			 */
			getURL: GetUrl<TSource>;
	  }
	| {
			/**
			 * A function that converts an object from your data into a list of image
			 * URLs used by the Gatsby image resolvers.
			 *
			 * @remarks
			 * When using this option, a network request will be made for each URL to
			 * fetch its dimensions (the results will be cached). If your data already
			 * contains the image dimensions, use the `generateImageSources` property
			 * in place of `getURLs`.
			 *
			 * If a single image should be returned, use the `getURL` property in
			 * place of `getURLs` (note the lack of pluralization).
			 */
			getURLs: GetUrls<TSource>;
	  }
);

/**
 * A version of `GenerateImageSource` that returns a list of image sources.
 *
 * @see {@link GenerateImageSource}
 */
export type GenerateImageSources<TSource> = (
	source: TSource,
) => (ImageSource | null)[] | Promise<(ImageSource | null)[]>;

/**
 * Returns an image URL from source data.
 *
 * @param source - Source data from which an image URL can be derived.
 *
 * @returns An image URL.
 */
export type GetUrl<TSource> = (
	source: TSource,
) => string | null | Promise<string | null>;

/**
 * Returns a list of image URLs from source data.
 *
 * @param source - Source data from which image URLs can be derived.
 *
 * @returns A list of image URLs.
 */
export type GetUrls<TSource> = (
	source: TSource,
) => (string | null)[] | Promise<(string | null)[]>;
