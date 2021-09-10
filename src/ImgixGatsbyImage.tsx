import * as React from "react";
import { GatsbyImage, GatsbyImageProps } from "gatsby-plugin-image";

import {
	getGatsbyImageData,
	GetGatsbyImageDataConfig,
} from "./getGatsbyImageData";

export type ImgixGatsbyImageProps = GetGatsbyImageDataConfig &
	Omit<GatsbyImageProps, "image">;

export const ImgixGatsbyImage = (props: ImgixGatsbyImageProps): JSX.Element => {
	const data = getGatsbyImageData(props);

	return <GatsbyImage image={data} {...props} />;
};
