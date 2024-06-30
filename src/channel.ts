import type { z } from "zod";
import {
  type InputCapability,
  type InputFromCapability,
  type OutputCapability,
  type OutputFromCapability,
  outputFromCapability,
} from "./io";

export type ChannelCapability = {
  input: InputCapability;
  output: OutputCapability;
  push?: boolean;
};

// channel capability should be determined at compile time
export class Channel<
  C extends {},
  T extends Readonly<ChannelCapability>,
  N extends Readonly<string>,
> {
  readonly name: N;
  readonly capability: T;
  readonly context: z.ZodType<C> | undefined;
  constructor(
    options:
      & { name: N }
      & { capability: T }
      & (T["push"] extends true ? { onPush: (content: OutputFromCapability<T["output"]>) => void } : object)
      & { context?: z.ZodType<C> },
  ) {
    this.name = options.name;
    this.capability = options.capability;
    this.context = options.context;
  }

  handleInput = (input: InputFromCapability<T["input"]>, ctx: C): OutputFromCapability<T["output"]> => {
    return null;
  };

  verifyOutput = (output: OutputFromCapability<T["output"]>) => {
    return outputFromCapability(this.capability.output).parse(output);
  };
}
