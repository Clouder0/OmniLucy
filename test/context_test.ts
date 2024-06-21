import { describe, expect, it, test } from "bun:test";
import { Context, ctx_manager } from "../src/context/context";

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
    ctx_manager.addContext(ctx);
    const res = ctx_manager.getContext({ user: "123" });
    expect(res.a).toBe(1);
    const res2 = ctx_manager.getContext({ user: "456" });
    expect(res2.a).toBeUndefined();
  });

  it("Multiple Context with override", () => {
    const ctx = new Context({ user: (s) => s === "123" }, { a: 1, b: 2 });
    const ctx2 = new Context({ user: (s) => s === "123", channel: (s) => s === "123" }, { a: 2, c: 3 });
    ctx_manager.addContext(ctx2);
    ctx_manager.addContext(ctx);
    const res = ctx_manager.getContext({ user: "123" });
    expect(res.a).toBe(1);
    expect(res.b).toBe(2);
    const res2 = ctx_manager.getContext({ user: "123", channel: "123" });
    expect(res2.a).toBe(2);
    expect(res2.b).toBe(2);
    expect(res2.c).toBe(3);
    const res3 = ctx_manager.getContext({ user: "123", channel: "456" });
    expect(res3.a).toBe(1);
    expect(res3.b).toBe(2);
  });
});
