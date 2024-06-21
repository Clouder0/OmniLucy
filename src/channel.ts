import type { InputCapability, InputFromCapability, OutputCapability, OutputFromCapability } from "./io";

type ChannelCapability = {
  input: InputCapability;
  output: OutputCapability;
  push?: boolean;
};

// channel capability should be determined at compile time
class Channel<
  T extends Readonly<ChannelCapability>,
> {
  readonly capability: T;
  onInput: (input: InputFromCapability<T["input"]>) => OutputFromCapability<T["output"]>;
  onPush: ((output: OutputFromCapability<T["output"]>) => void) | undefined;
  constructor(
    options:
      & ({
        capability: T;
        onInput: (input: InputFromCapability<T["input"]>) => OutputFromCapability<T["output"]>;
      })
      & (T["push"] extends true ? { onPush: (output: OutputFromCapability<T["output"]>) => void } : unknown),
  ) {
    this.capability = options.capability;
    this.onInput = options.onInput;
    this.onPush = options.capability.push
      ? (options as unknown as { onPush: (output: OutputFromCapability<T["output"]>) => void }).onPush
      : undefined;
  }
}
