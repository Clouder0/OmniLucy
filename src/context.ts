import log from "./utils/log";
import { objectEntries, objectKeys } from "./utils/typed";

type Status = {
  user?: string;
  channel?: string;
  conversation?: string;
};

export type Matcher<T extends keyof Status> = (s: NonNullable<Status[T]>) => boolean;

export type ContextMap = Record<string, unknown>;

export type StatusMatcher = {
  [key in keyof Status]: Matcher<key>;
};

export class Context<T extends ContextMap> {
  match_rules: StatusMatcher;
  data: T;
  constructor(match_rules: StatusMatcher, initial_data: T) {
    this.match_rules = match_rules;
    this.data = initial_data;
  }

  check = (s: Status): boolean => {
    return objectEntries(this.match_rules).every(([key, matcher]) => {
      if (matcher === undefined) {
        log.warn(`Matcher for ${key} is undefined`);
        return true;
      }
      if (s[key] === undefined) return false;
      return matcher(s[key] as NonNullable<Status[typeof key]>);
    });
  };
}

const matcherComplexity = (m: StatusMatcher) => objectKeys(m).length;

export class ContextManager {
  ctxs: Context<ContextMap>[] = [];

  addContext = <T extends ContextMap>(ctx: Context<T>) => {
    this.ctxs.push(ctx);
  };

  // get Context will return snapshot by default, this means all primitive types will be copied
  // sometimes it will be expensive to copy all data, so use with caution. You can get Proxy instead
  getContext = (s: Status): Readonly<ContextMap> => {
    return this.ctxs.filter((x) => x.check(s)) // filter all context that matches
      // sort by match_rule length incrementing, to allow more complex ctx overriding previous ctx
      .toSorted((a, b) => matcherComplexity(a.match_rules) - matcherComplexity(b.match_rules))
      .map((x) => x.data).reduce((acc, x) => (Object.assign(acc, x)), {} as ContextMap);
  };

  getContextProxy = (s: Status): ContextMap => {
    const ctx_sequence = this.ctxs.filter((x) => x.check(s)) // filter all context that matches
      // sort by match_rule length decrementing, to allow more complex ctx return first
      .toSorted((a, b) => matcherComplexity(b.match_rules) - matcherComplexity(a.match_rules));

    // read/write will directly affect the target context, so everything will be in realtime
    return new Proxy({} as ContextMap, {
      get: (_, prop, __) => {
        for (const ctx of ctx_sequence) {
          if (prop in ctx.data) {
            return ctx.data[prop as string];
          }
        }
        return undefined;
      },
      set: (_, prop, value, __) => {
        for (const ctx of ctx_sequence) {
          if (prop in ctx.data) {
            ctx.data[prop as string] = value;
            return true;
          }
        }
        return false;
      },
    });
  };
}

export const ctx_manager = new ContextManager();
