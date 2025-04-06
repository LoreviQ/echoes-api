export enum ContentType {
    POST = "post",
    CHARACTER = "character"
}

// Reference to content without the actual data
export type ContentReference = {
    type: ContentType;
    id: string;
    nsfw?: boolean;
}; 