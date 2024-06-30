import { z } from "zod";

const text = z.string();
type Text = z.infer<typeof text>;
const image = z.number(); // mock
type Image = z.infer<typeof image>;

// one hyper text has multiple blocks, one block has multiple elements

const hyperElementCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
});
type HyperElementCapability = z.infer<typeof hyperElementCapability>;
const hyperElementFromCapability = <T extends Readonly<HyperElementCapability>>(capability: T) => {
  return (capability.text ? text : z.never()).or(capability.image ? image : z.never());
};
type HyperElementFromCapability<T extends Readonly<HyperElementCapability>> =
  | (T["text"] extends true ? Text : never)
  | (T["image"] extends true ? Image : never);

const hyperBlockCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
  hyperElement: hyperElementCapability.optional(),
});
type HyperBlockCapability = z.infer<typeof hyperBlockCapability>;
const hyperBlockFromCapability = <T extends Readonly<HyperBlockCapability>>(capability: T) => {
  return (capability.text ? text : z.never()).or(capability.image ? image : z.never()).or(
    capability.hyperElement ? z.array(hyperElementFromCapability(capability.hyperElement)) : z.never(),
  );
};
type HyperBlockFromCapability<T extends Readonly<HyperBlockCapability>> =
  | (T["text"] extends true ? Text : never)
  | (T["image"] extends true ? Image : never)
  | (T["hyperElement"] extends HyperElementCapability ? HyperElementFromCapability<T["hyperElement"]>[] : never);

const hyperTextCapability = hyperBlockCapability;
type HyperTextCapability = z.infer<typeof hyperTextCapability>;
const hyperTextFromCapability = <T extends Readonly<HyperTextCapability>>(capability: T) => {
  return z.array(hyperBlockFromCapability(capability));
};
type HyperTextFromCapability<T extends Readonly<HyperTextCapability>> = HyperBlockFromCapability<T>[];

const inputCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
  hyperText: hyperTextCapability.optional(),
});
export type InputCapability = z.infer<typeof inputCapability>;
export const inputFromCapability = <T extends Readonly<InputCapability>>(capability: T) => {
  return (capability.text ? z.strictObject({ content_type: z.literal("text"), content: text }) : z.never()).or(
    capability.image ? z.strictObject({ content_type: z.literal("image"), content: image }) : z.never(),
  ).or(
    capability.hyperText
      ? z.strictObject({ content_type: z.literal("hyperText"), content: hyperTextFromCapability(capability.hyperText) })
      : z.never(),
  );
};
export type InputFromCapability<T extends Readonly<InputCapability>> =
  | (T["text"] extends true ? { content_type: "text"; content: Text } : never)
  | (T["image"] extends true ? { content_type: "image"; content: Image } : never)
  | (T["hyperText"] extends true ? { content_type: "hyperText"; content: HyperTextFromCapability<T["hyperText"]> }
    : never);

const outputCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
  hyperText: hyperTextCapability.optional(),
});
export type OutputCapability = z.infer<typeof outputCapability>;
export const outputFromCapability = <T extends Readonly<OutputCapability>>(capability: T) => {
  const constraint1 = capability.text ? z.strictObject({ content_type: z.literal("text"), content: text }) : z.never();
  const constraint2 = capability.image
    ? z.strictObject({ content_type: z.literal("image"), content: image })
    : z.never();
  const constraint3 = capability.hyperText
    ? z.strictObject({ content_type: z.literal("hyperText"), content: hyperTextFromCapability(capability.hyperText) })
    : z.never();
  return constraint1.or(constraint2).or(constraint3).or(z.null());
};
export type OutputFromCapability<T extends Readonly<OutputCapability>> =
  | (T["text"] extends true ? { content_type: "text"; content: Text } : never)
  | (T["image"] extends true ? { content_type: "image"; content: Image } : never)
  | (T["hyperText"] extends true ? { content_type: "hyperText"; content: HyperTextFromCapability<T["hyperText"]> }
    : never)
  | null;
type test = OutputFromCapability<{ text: true }>;

export const verifyOutputCapability = <T extends Readonly<OutputCapability>>(
  capability: T,
  output: OutputFromCapability<T>,
): boolean => {
  return outputFromCapability(capability).safeParse(output).success;
};
