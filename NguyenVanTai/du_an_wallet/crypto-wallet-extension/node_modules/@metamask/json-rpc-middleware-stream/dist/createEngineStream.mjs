import { Duplex } from "readable-stream";
/**
 * Takes a JsonRpcEngine and returns a Duplex stream wrapping it.
 *
 * @param opts - Options bag.
 * @param opts.engine - The JsonRpcEngine to wrap in a stream.
 * @returns The stream wrapping the engine.
 */
export default function createEngineStream(opts) {
    if (!opts?.engine) {
        throw new Error('Missing engine parameter!');
    }
    const { engine } = opts;
    const stream = new Duplex({ objectMode: true, read: () => undefined, write });
    // forward notifications
    if (engine.on) {
        engine.on('notification', (message) => {
            stream.push(message);
        });
    }
    return stream;
    /**
     * Write a JSON-RPC request to the stream.
     *
     * @param req - The JSON-rpc request.
     * @param _encoding - The stream encoding, not used.
     * @param streamWriteCallback - The stream write callback.
     */
    function write(req, _encoding, streamWriteCallback) {
        engine.handle(req, (_err, res) => {
            stream.push(res);
        });
        streamWriteCallback();
    }
}
//# sourceMappingURL=createEngineStream.mjs.map