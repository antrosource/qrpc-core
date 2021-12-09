import { z } from "zod";
import QRPC from "./index";

const qRpcInstance = new QRPC();

qRpcInstance.register("add", {
  takes: z.array(z.number()).min(2).max(2),
  returns: z.promise(z.number()),
  async runs(params) {
    const [a, b] = params;
    return Number(a) + Number(b);
  },
});

qRpcInstance.register("rgb", {
  takes: z.object({
    red: z.number(),
    green: z.number(),
    blue: z.number(),
  }),
  returns: z.promise(z.string()),
  async runs(params) {
    const { red, green, blue } = params;
    return `rgb(${red}, ${green}, ${blue})`;
  },
});

qRpcInstance.register("hello", {
  takes: z.undefined(),
  returns: z.string(),
  runs() {
    return "world";
  },
});

console.log(qRpcInstance.execute("add", [1, 2]));
console.log(qRpcInstance.execute("rgb", { red: 255, green: 0, blue: 0 }));
console.log(qRpcInstance.execute("hello", undefined));
