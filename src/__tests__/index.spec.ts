import QRPC from "..";
import { z } from "zod";

function registerTest(instance: QRPC) {
  instance.register("test", {
    takes: z.array(z.number()).min(2).max(2),
    returns: z.number(),
    runs: (args) => {
      const [a, b] = args;
      return Number(a) + Number(b);
    },
  });
}

describe("QRPC", () => {
  beforeAll(() => {});

  it("correctly registers and executes a function", () => {
    const instance = new QRPC();
    registerTest(instance);
    expect(instance.execute("test", [2, 5]));
  });

  it("cannot register a function twice", () => {
    expect(() => {
      const instance = new QRPC();
      registerTest(instance);
      instance.register("Test", {
        takes: z.array(z.number()).min(2).max(2),
        returns: z.number(),
        runs: (args) => {
          const [a, b] = args;
          return Number(a) + Number(b);
        },
      });
    }).toThrow();
  });
});
