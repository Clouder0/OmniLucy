import log from "../utils/log";
import { objectEntries, objectKeys } from "../utils/typed";

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

  getContext = (s: Status): ContextMap => {
    return this.ctxs.filter((x) => x.check(s)) // filter all context that matches
      // sort by match_rule length incrementing, to allow more complex ctx override previous ctx
      .toSorted((a, b) => matcherComplexity(a.match_rules) - matcherComplexity(b.match_rules))
      .map((x) => x.data).reduce((prev, now) => Object.assign(prev, now), {}); // reduce to one single final ContextMap
  };
}

export const ctx_manager = new ContextManager();
