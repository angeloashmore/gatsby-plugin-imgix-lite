export enum ImgixLiteGraphQLTypeName {
	GatsbyImageDataPlaceholderEnum = "ImgixLiteGatsbyImageDataPlaceholder",
	ImgixParamsInputObject = "ImgixLiteImgixParamsInputObject",
	GatsbyImageDataObject = "ImgixLiteGatsbyImageData",
	ImageFixedObject = "ImgixLiteImageFixed",
	ImageFluidObject = "ImgixLiteImageFluid",
}

export enum ImgixLiteGatsbyImageDataPlaceholderKind {
	Blurred = "blurred",
	DominantColor = "dominantColor",
	None = "none",
}

export type ImgixLiteUrlParams = Record<string, string | number>;

export interface ImgixPalleteLike {
	dominant_colors: {
		vibrant: {
			hex: string;
		};
	};
}

export interface ImageSource {
	url: string;
	width: number;
	height: number;
}

export type GenerateImageSource<TSource> = (
	source: TSource,
) => ImageSource | null;
