import { fromArrayBuffer, fromString } from "./deserializer";

export function decryptor(event: MessageEvent) {

    const { data } = event;
    
    if (typeof data === 'string') {
        return data;
    } else {
        return fromArrayBuffer(data);
    }
}