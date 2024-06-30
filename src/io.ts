import { z } from "zod";

const text = z.string();
const image = z.number(); // mock

// one hyper text has multiple blocks, one block has multiple elements

const hyperElementCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
});
type HyperElementCapability = z.infer<typeof hyperElementCapability>;
const hyperElementFromCapability = <T extends Readonly<HyperElementCapability>>(capability: T) => {
  return (capability.text ? text : z.never()).or(capability.image ? image : z.never());
};

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

const hyperTextCapability = hyperBlockCapability;
type HyperTextCapability = z.infer<typeof hyperTextCapability>;
const hyperTextFromCapability = <T extends Readonly<HyperTextCapability>>(capability: T) => {
  return z.array(hyperBlockFromCapability(capability));
};

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
export type InputFromCapability<T extends Readonly<InputCapability>> = z.infer<
  ReturnType<typeof inputFromCapability<T>>
>;

const outputCapability = z.strictObject({
  text: z.boolean().optional(),
  image: z.boolean().optional(),
  hyperText: hyperTextCapability.optional(),
});
export type OutputCapability = z.infer<typeof outputCapability>;
export const outputFromCapability = <T extends Readonly<OutputCapability>>(capability: T) => {
  return (capability.text ? z.strictObject({ content_type: z.literal("text"), content: text }) : z.never()).or(
    capability.image ? z.strictObject({ content_type: z.literal("image"), content: image }) : z.never(),
  ).or(
    capability.hyperText
      ? z.strictObject({ content_type: z.literal("hyperText"), content: hyperTextFromCapability(capability.hyperText) })
      : z.never(),
  ).or(z.null());
};
export type OutputFromCapability<T extends Readonly<OutputCapability>> = z.infer<
  ReturnType<typeof outputFromCapability<T>>
>;

export const verifyOutputCapability = <T extends Readonly<OutputCapability>>(
  capability: T,
  output: OutputFromCapability<T>,
): boolean => {
  return outputFromCapability(capability).safeParse(output).success;
};
