

export function serializer<T>(data: T): Uint8Array {
    const str = (typeof data == 'string') ? data : stringify(data);

    var n = str.length,
        idx = -1,
        byteLength = 512,
        bytes = new Uint8Array(byteLength),
        i: any, c: any, _bytes: any;

    for (i = 0; i < n; ++i) {
        c = str.charCodeAt(i);
        if (c <= 0x7F) {
            bytes[++idx] = c;
        } else if (c <= 0x7FF) {
            bytes[++idx] = 0xC0 | (c >>> 6);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else if (c <= 0xFFFF) {
            bytes[++idx] = 0xE0 | (c >>> 12);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else {
            bytes[++idx] = 0xF0 | (c >>> 18);
            bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        }
        if (byteLength - idx <= 4) {
            _bytes = bytes;
            byteLength *= 2;
            bytes = new Uint8Array(byteLength);
            bytes.set(_bytes);
        }
    }
    return bytes.subarray(0, ++idx);
}

export function stringify<T>(data: T): string {
    return JSON.stringify(data);
}