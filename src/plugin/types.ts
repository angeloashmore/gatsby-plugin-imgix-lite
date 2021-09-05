import { PluginOptions as GatsbyPluginOptions } from "gatsby";

import { GenerateImageSource, ImgixParams, ImageSource } from "../index.server";

export enum SourceType {
	AmazonS3 = "s3",
	GoogleCloudStorage = "gcs",
	MicrosoftAzure = "azure",
	WebFolder = "webFolder",
	WebProxy = "webProxy",
}

type FieldConfig<TSource = unknown> = {
	nodeType: string;
	fieldName: string;
} & (
	| { generateImageSource: GenerateImageSource<TSource> }
	| { generateImageSources: GenerateImageSources<TSource> }
	| { getURL: GetUrl<TSource> }
	| { getURLs: GetUrls<TSource> }
);

/**
 * A version of `GenerateImageSource` that returns a list of image sources.
 *
 * @see {@link GenerateImageSource}
 */
export type GenerateImageSources<TSource> = (
	source: TSource,
) => (ImageSource | null)[] | Promise<(ImageSource | null)[]>;

export type GetUrl<TSource> = (
	source: TSource,
) => string | null | Promise<string | null>;

export type GetUrls<TSource> = (
	source: TSource,
) => (string | null)[] | Promise<(string | null)[]>;

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
