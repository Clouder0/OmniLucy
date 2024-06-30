import type { Status } from "./context";
import { handlerManager } from "./handler";
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

type OptionsFromCapability<T extends ChannelCapability> = {
  name: string;
  capability: T;
} & (T["push"] extends true ? { onPush: (content: OutputFromCapability<T["output"]>) => void } : object);

// channel capability should be determined at compile time
export class Channel<
  T extends Readonly<ChannelCapability>,
> {
  readonly name: string;
  readonly capability: T;
  constructor(
    options: OptionsFromCapability<T>,
  ) {
    this.name = options.name;
    this.capability = options.capability;
  }

  handleInput = (s: Status, input: InputFromCapability<T["input"]>): OutputFromCapability<T["output"]> => {
    return handlerManager.handleInput(this, {
      ...s,
      channel: this.name,
    }, input);
  };

  verifyOutput = (output: OutputFromCapability<T["output"]>) => {
    return outputFromCapability(this.capability.output).parse(output);
  };
}

export class ChannelManager {
  chans: Channel<Readonly<ChannelCapability>>[] = [];

  getChannel = (name: string) => {
    return this.chans.find((x) => x.name === name);
  };

  addChannel = <T extends ChannelCapability>(
    options:
      & { name: Readonly<string>; capability: T }
      & (T["push"] extends true ? { onPush: (content: OutputFromCapability<T["output"]>) => void } : object),
  ) => {
    const chan = new Channel(options);
    this.chans.push(chan);
    return chan;
  };
}

export const channelManager = new ChannelManager();
