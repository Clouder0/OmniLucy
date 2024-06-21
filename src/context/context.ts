import log from "../utils/log";
import { objectEntries, objectKeys } from "../utils/typed";

type Status = {
  user?: string;
  channel?: string;
  conversation?: string;
};

export type Matcher<T extends keyof Status> = (s: NonNullable<Status[T]>) => boolean;

export type ContextMap = Readonly<Record<string, unknown>>;

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

  getContext = (s: Status): ContextMap => {
    const ctx_sequence = this.ctxs.filter((x) => x.check(s)) // filter all context that matches
      // sort by match_rule length decrementing, to allow more complex ctx return first
      .toSorted((a, b) => matcherComplexity(b.match_rules) - matcherComplexity(a.match_rules));

    // only allow read, write is forbidden
    // if write is needed, use object, or wrap primitive type in object to be referenced
    return new Proxy({} as ContextMap, {
      get: (_, prop, __) => {
        for (const ctx of ctx_sequence) {
          if (prop in ctx.data) {
            return ctx.data[prop as string];
          }
        }
        return undefined;
      },
    });
  };
}

export const ctx_manager = new ContextManager();
