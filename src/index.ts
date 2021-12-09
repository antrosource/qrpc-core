import { z } from "zod";
import type { ZodTypeAny } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { QRPC_ERROR } from "./errors";

type QRPC_OPTION = {
  description?: string;
  takes: ZodTypeAny;
  returns: ZodTypeAny;
  runs: (params: unknown, context: unknown) => unknown;
};

class QRPC {
  private store: Map<string, QRPC_OPTION>;
  private docCache: Record<string, unknown>[] = [];
  private nameTracker: Set<string>;

  constructor() {
    this.store = new Map();
    this.nameTracker = new Set();
  }

  register<T extends ZodTypeAny, R extends ZodTypeAny>(
    name: string,
    options: {
      description?: string;
      takes: T;
      returns: R;
      runs: (params: z.infer<T>, context: unknown) => z.infer<R>;
    }
  ) {
    const nameInternal = name.toLowerCase();
    const exists = this.nameTracker.has(nameInternal);
    if (exists) {
      throw new Error(
        `QRPC: ${name} has already been registered as a procedure`
      );
    }

    this.nameTracker.add(nameInternal);
    this.store.set(name, options);
  }

  execute(name: string, params: unknown, context?: unknown) {
    const methodStore = this.store.get(name);
    if (!methodStore) {
      throw new QRPC_ERROR(`${name} is not a registered procedure`);
    }

    const validatedParams = methodStore.takes.parse(params);

    const response = methodStore.runs(validatedParams, context);
    return response;
  }

  async doc(params?: { nameOnly?: boolean }) {
    if (params && params.nameOnly) {
      const obj = Object.fromEntries(this.store);
      return Object.keys(obj);
    }

    if (this.docCache.length > 0) return this.docCache;

    let procedures: Record<string, unknown>[] = [];

    for (let [name, method] of this.store) {
      const data: typeof procedures[number] = { methodName: name };

      data["takes"] = zodToJsonSchema(method.takes);
      data["returns"] = zodToJsonSchema(method.returns);
      data["description"] = method.description;
      procedures.push(data);
    }

    this.docCache = procedures;
    return procedures;
  }
}

export default QRPC;
