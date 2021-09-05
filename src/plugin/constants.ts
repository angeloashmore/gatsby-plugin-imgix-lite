export const NAMESPACE = "Imgix";

export enum SourceType {
	AmazonS3 = "s3",
	GoogleCloudStorage = "gcs",
	MicrosoftAzure = "azure",
	WebFolder = "webFolder",
	WebProxy = "webProxy",
}

/**
 * GraphQL type names used for GraphQL type and field builders.
 */
export enum GraphQLTypeName {
	/**
	 * Collection of Imgix image resolvers.
	 */
	Image = "Image",
}
