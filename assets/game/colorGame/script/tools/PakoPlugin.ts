import * as pako from 'pako';

export class PakoPlugin {
    static compress(data: string | Uint8Array): Uint8Array {
        if (typeof data === 'string') {
            return pako.deflate(new TextEncoder().encode(data));
        }
        return pako.deflate(data);
    }

    static decompress(data: Uint8Array): string {
        const decompressed = pako.inflate(data);
        return new TextDecoder().decode(decompressed);
    }
}