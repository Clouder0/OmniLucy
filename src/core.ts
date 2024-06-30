import { z } from "zod";
import { Channel, type ChannelCapability } from "./channel";
import type { OutputFromCapability } from "./io";

type LucyCtx = {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  channels: {};
};

type ContextFromLucy<C extends LucyCtx> = {
  [name in keyof C["channels"]]: (
    & ({
      chan_name: name; // required to retrieve type information, see T000
      chan: C["channels"][name];
    })
    & (C["channels"][name] extends Channel<infer C, infer T, infer N> ? C : never)
  );
}[keyof C["channels"]];

type LucyTransformer<T> = (ctx: T) => unknown;
type LucyHandler<CC> = (
  ctx: CC,
) => // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
| void
| (CC extends { chan: Channel<any, any, any> } ? OutputFromCapability<CC["chan"]["capability"]["output"]>
  : never);

type channelItem<C extends Channel<any, any, any>> = {
  [name in C["name"]]: C;
};
type channelItems<CS extends Array<Channel<any, any, any>>> = channelItem<CS[number]>;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
class Lucy<C extends LucyCtx, CC = {}> {
  channels: C["channels"] = {};
  handlers: (LucyTransformer<CC> | LucyHandler<ContextFromLucy<C> & CC>)[] = [];

  useChannel = <V extends Record<string, unknown>, T extends ChannelCapability, N extends Readonly<string>>(
    chan: Channel<V, T, N>,
  ): Lucy<C & { channels: channelItem<typeof chan> }, CC> => {
    ((this.channels as Record<string, object>)[chan.name] as object) = chan;
    return this as unknown as Lucy<C & { channels: channelItem<typeof chan> }, CC>;
  };

  useChannels = <T extends Channel<any, any, any>>(
    chans: T[],
  ): Lucy<C & { channels: channelItems<typeof chans> }, CC> => {
    for (const chan of chans) {
      ((this.channels as Record<string, object>)[chan.name] as object) = chan;
    }
    return this as unknown as Lucy<C & { channels: channelItems<typeof chans> }, CC>;
  };

  transform = <T extends LucyTransformer<CC>>(transformer: T): Lucy<C, CC & ReturnType<T>> => {
    this.handlers.push(transformer);
    return this as unknown as Lucy<C, CC & ReturnType<T>>;
  };

  handle = (handler: LucyHandler<ContextFromLucy<C> & CC>): Lucy<C, CC> => {
    this.handlers.push(handler);
    return this;
  };
}

const chan = new Channel({
  capability: { input: { text: true }, output: { image: true, text: true } },
  name: "test",
  context: z.strictObject({ a: z.string() }),
});
const chan2 = new Channel({ capability: { input: { text: true }, output: { image: true } }, name: "test2" });

const L = new Lucy().useChannel(chan).useChannel(chan2).transform((ctx) => {
  return {
    ...ctx,
    added: "123" as const,
  };
}).handle((ctx) => {
});

/* NOTICE: type related bug T000
 * this can retain type info
type ta = {
    id: "123",
} & {a:123}
type tb = {
    id: "456"
} & {b: 456}

type union_ab = ta | tb
const hand = (x : union_ab) => {
    if(x.id === "123") {
        x.a
    }
}
*/
/*
 * this can't
type ta = {
    id: {inner:"123"},
} & {a:123}
type tb = {
    id: {inner:"456"},
} & {b: 456}

type union_ab = ta | tb
const hand = (x : union_ab) => {
    if(x.id.inner === "123") {
        x.a // unresolved
    }
}
*/
