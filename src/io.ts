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
  hyperBlock?: HyperBlockCapability;
};

export type HyperBlockFromCapability<T extends HyperBlockCapability> =
  | (T extends { text: true } ? Text : never)
  | (T extends { image: true } ? Image : never);

export type HyperSegmentFromCapability<T extends HyperTextCapability> =
  | (T extends { text: true } ? Text : never)
  | (T extends { image: true } ? Image : never)
  | (T["hyperBlock"] extends HyperBlockCapability ? (HyperBlockFromCapability<T["hyperBlock"]>)[]
    : never);
export type HyperTextFromCapability<T extends HyperTextCapability> = HyperSegmentFromCapability<T>[];

export type InputCapability = {
  text?: boolean;
  image?: boolean;
  hyperText?: HyperTextCapability;
};

export type InputContentFromCapability<T extends InputCapability> =
  | (T["text"] extends true ? Text : never)
  | (T["image"] extends true ? Image : never)
  | (T["hyperText"] extends HyperTextCapability ? HyperTextFromCapability<T["hyperText"]>
    : never);

export type InputFromCapability<T extends InputCapability> =
  | (T["text"] extends true ? {
      content_type: "text";
      content: Text;
    }
    : never)
  | (T["image"] extends true ? {
      content_type: "image";
      content: Image;
    }
    : never)
  | (T["hyperText"] extends HyperTextCapability ? {
      content_type: "hyperText";
      content: HyperText & InputContentFromCapability<T>;
    }
    : never);

export type OutputCapability = {
  text?: boolean;
  image?: boolean;
  hyperText?: HyperTextCapability;
};
export type OutputContentFromCapability<T extends OutputCapability> =
  | (T["text"] extends true ? Text : never)
  | (T["image"] extends true ? Image : never)
  | (T extends ({ hyperText: HyperTextCapability }) ? HyperTextFromCapability<T["hyperText"]>
    : never);

export type OutputFromCapability<T extends OutputCapability> =
  | (T["text"] extends true ? {
      content_type: "text";
      content: Text;
    }
    : never)
  | (T["image"] extends true ? {
      content_type: "image";
      content: Image;
    }
    : never)
  | (T["hyperText"] extends HyperTextCapability ? {
      content_type: "hyperText";
      content: HyperText & OutputContentFromCapability<T>;
    }
    : never);
