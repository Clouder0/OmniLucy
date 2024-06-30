import type { Channel, ChannelCapability } from "./channel";
import type { Status } from "./context";
import type { InputFromCapability, OutputFromCapability } from "./io";

type handlerFunction = <T extends ChannelCapability>(
  ctx: {
    chan: Channel<T>;
    s: Status;
    input: InputFromCapability<T["input"]>;
    next: (now_output: OutputFromCapability<T["output"]> | null) => void;
    last_output: OutputFromCapability<T["output"]>;
  },
) => OutputFromCapability<T["output"]>;

export class Handler {
  handlers: handlerFunction[] = [];
  handleInput = <T extends ChannelCapability>(
    chan: Channel<T>,
    s: Status,
    input: InputFromCapability<T["input"]>,
  ): OutputFromCapability<T["output"]> => {
    let output: OutputFromCapability<T["output"]> = null;
    for (const handler of this.handlers) {
      let next_handler = false;
      const res_output = handler({
        chan,
        s,
        input,
        last_output: output,
        next: (now_output: OutputFromCapability<T["output"]> | null) => {
          next_handler = true;
          output = now_output ?? output;
        },
      });
      if (!next_handler) return chan.verifyOutput(res_output);
    }
    return chan.verifyOutput(output);
  };

  addHandler = (handler: handlerFunction) => {
    this.handlers.push(handler);
  };
}

export const handlerManager = new Handler();
