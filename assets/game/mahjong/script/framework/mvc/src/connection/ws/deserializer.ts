

export function deserializer(event: MessageEvent) {

    const { data } = event;

    if (typeof data === 'string') {
        return fromString(data);
    } else {
        return fromString(fromArrayBuffer(data));
    }
}

export function fromString<T>(data: string): T {
    return JSON.parse(data);
}

export function fromArrayBuffer(data: ArrayBuffer) {
    var array = new Uint8Array(data);
    var resultString: string, i: number, len: number, c: number;
    var char2: number, char3: number;

    resultString = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                resultString += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                resultString += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                resultString += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }


    return resultString;
}