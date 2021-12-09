export class QRPC_ERROR extends Error {
  constructor(msg: string) {
    const str = "QRPC: " + msg;
    super(str);
  }
}
