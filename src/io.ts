export type Text = string;
export type Image = number; // TODO: make an image class actually, supporting different formats, now it's a placeholder
export type Element = Text | Image;
export type HyperBlock = Element[];
export type HyperSegment = Text | Image | HyperBlock;
export type HyperText = HyperSegment[];

export type Input = Text | Image | HyperText;
export type HyperBlockCapability = {
  text?: boolean;
  image?: boolean;
};

export type HyperTextCapability = {
  text?: boolean;
  image?: boolean;
  hyperBlock?: boolean;
  hyperBlockContent?: HyperBlockCapability;
};
export type InputCapability = {
  text?: boolean;
  image?: boolean;
  hyperText?: boolean;
  hyperTextContent?: HyperTextCapability;
};
export type OutputCapability = {
  text?: boolean;
  image?: boolean;
  hyperText?: boolean;
  hyperTextContent?: HyperTextCapability;
};
export type HyperBlockFromCapability<T extends HyperBlockCapability> =
  | (T extends { text: true } ? Text : never)
  | (T extends { image: true } ? Image : never);

export type HyperSegmentFromCapability<T extends HyperTextCapability> =
  | (T extends { text: true } ? Text : never)
  | (T extends { image: true } ? Image : never)
  | (T extends { hyperBlock: true; hyperBlockContent: HyperBlockCapability }
    ? HyperBlockFromCapability<T["hyperBlockContent"]>
    : never);
export type HyperTextFromCapability<T extends HyperTextCapability> = HyperSegmentFromCapability<T>[];

export type InputContentFromCapability<T extends InputCapability> =
  | (T extends { text: false | undefined } ? never : Text)
  | (T extends { image: false | undefined } ? never : Image)
  | (T extends { hyperText: true; hyperTextContent: HyperTextCapability }
    ? HyperTextFromCapability<T["hyperTextContent"]>
    : never);

export type InputFromCapability<T extends InputCapability> =
  | (Text extends InputContentFromCapability<T> ? {
      content_type: "text";
      content: Text;
    }
    : never)
  | (Image extends InputContentFromCapability<T> ? {
      content_type: "image";
      content: Image;
    }
    : never)
  | (HyperText extends InputContentFromCapability<T> ? {
      content_type: "hyperText";
      content: HyperText & InputContentFromCapability<T>;
    }
    : never);

export type OutputContentFromCapability<T extends OutputCapability> =
  | (T extends { text: false | undefined } ? never : Text)
  | (T extends { image: false | undefined } ? never : Image)
  | (T extends { hyperText: true; hyperTextContent: HyperTextCapability }
    ? HyperTextFromCapability<T["hyperTextContent"]>
    : never);

export type OutputFromCapability<T extends OutputCapability> =
  | (Text extends OutputContentFromCapability<T> ? {
      content_type: "text";
      content: Text;
    }
    : never)
  | (Image extends OutputContentFromCapability<T> ? {
      content_type: "image";
      content: Image;
    }
    : never)
  | (HyperText extends OutputContentFromCapability<T> ? {
      content_type: "hyperText";
      content: HyperText & OutputContentFromCapability<T>;
    }
    : never);
