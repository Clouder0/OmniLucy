import { describe, expect, it, test } from "bun:test";
import { Context, ContextManager } from "../src/context/context";
import log from "../src/utils/log";
import { Wrapper } from "../src/utils/misc";

describe("Matcher", () => {
  it("Null Matcher", () => {
    const ctx = new Context({}, { a: 1 });
    const status = {};
    expect(ctx.check(status)).toBeTrue();
    const status1 = { user: "123" };
    expect(ctx.check(status1)).toBeTrue();
  });

  it("Single User Matcher", () => {
    const ctx = new Context({ user: (s) => s === "123" }, { a: 1 });
    expect(ctx.check({})).toBeFalse();
    expect(ctx.check({ user: "456" })).toBeFalse();
    expect(ctx.check({ user: "123" })).toBeTrue();
    expect(ctx.check({ user: "123", conversation: "123" })).toBeTrue();
    expect(ctx.check({ conversation: "123" })).toBeFalse();
  });

  it("Single Channel Matcher", () => {
    const ctx = new Context({ channel: (s) => s === "123" }, { a: 1 });
    expect(ctx.check({})).toBeFalse();
    expect(ctx.check({ channel: "456" })).toBeFalse();
    expect(ctx.check({ channel: "123" })).toBeTrue();
  });

  it("Single Conversation Matcher", () => {
    const ctx = new Context({ conversation: (s) => s === "123" }, { a: 1 });
    expect(ctx.check({})).toBeFalse();
    expect(ctx.check({ conversation: "456" })).toBeFalse();
    expect(ctx.check({ conversation: "123" })).toBeTrue();
  });

  it("Multiple Matcher", () => {
    const ctx = new Context({ user: (s) => s === "123", channel: (s) => s === "123" }, { a: 1 });
    expect(ctx.check({})).toBeFalse();
    expect(ctx.check({ user: "123" })).toBeFalse();
    expect(ctx.check({ channel: "123" })).toBeFalse();
    expect(ctx.check({ user: "123", channel: "123" })).toBeTrue();
    expect(ctx.check({ user: "123", channel: "456" })).toBeFalse();
    expect(ctx.check({ user: "123", conversation: "123" })).toBeFalse();
  });
});

describe("ContextManager", () => {
  it("Single Context", () => {
    const ctx = new Context({ user: (s) => s === "123" }, { a: 1 });
    const manager = new ContextManager();
    manager.addContext(ctx);
    const res = manager.getContext({ user: "123" });
    expect(res.a).toBe(1);
    const res2 = manager.getContext({ user: "456" });
    expect(res2.a).toBeUndefined();
  });

  it("Multiple Context with override", () => {
    const manager = new ContextManager();
    const ctx = new Context({ user: (s) => s === "123" }, { a: new Wrapper(1), b: new Wrapper(2) });
    const ctx2 = new Context({ user: (s) => s === "123", channel: (s) => s === "123" }, {
      a: new Wrapper(2),
      c: new Wrapper(3),
    });
    manager.addContext(ctx2);
    manager.addContext(ctx);
    const res = manager.getContext({ user: "123" });
    expect(res.a).toHaveProperty("value", 1);
    expect(res.b).toHaveProperty("value", 2);
    const res2 = manager.getContext({ user: "123", channel: "123" });
    expect(res2.a).toHaveProperty("value", 2);
    expect(res2.b).toHaveProperty("value", 2);
    expect(res2.c).toHaveProperty("value", 3);
    const res3 = manager.getContext({ user: "123", channel: "456" });
    expect(res3.a).toHaveProperty("value", 1);
    expect(res3.b).toHaveProperty("value", 2);

    // test writes
    ((res3.a) as Wrapper<number>).value = 3; // should write to ctx
    expect(res3.a).toHaveProperty("value", 3);
    expect(ctx.data.a).toHaveProperty("value", 3);
    expect(res.a).toHaveProperty("value", 3);
    ((res2.b) as Wrapper<number>).value = 4; // should write to ctx
    ((res2.a) as Wrapper<number>).value = 5; // should write to ctx2
    ((res2.c) as Wrapper<number>).value = 6; // should write to ctx2
    expect(ctx2.data.a).toHaveProperty("value", 5);
    expect(ctx2.data.c).toHaveProperty("value", 6);
    expect(ctx.data.a).toHaveProperty("value", 3);
  });
});
