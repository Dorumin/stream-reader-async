import { Readable } from 'stream';

export class ReadableBuffer extends Readable {
    private buffer: Buffer;
    private sent: boolean;

    constructor(buffer: Buffer) {
        super();
        this.buffer = buffer;
        this.sent = false;
    }

    _read() {
        if (!this.sent) {
            this.push(this.buffer);
            this.sent = true;
        } else {
            this.push(null);
        }
    }
}

export default class AsyncStreamReader {
    private stream: Readable;
    public finished: boolean;
    public closed: boolean;
    public offset: number;

    constructor(stream: Readable | Buffer) {
        if (stream instanceof Buffer) {
            stream = new ReadableBuffer(stream);
        }

        this.stream = stream;
        this.offset = 0;
        this.closed = false;
        this.finished = false;

        // Noop so .once calls don't reset each time
        stream.on('readable', this.onReadable.bind(this));
        stream.on('close', this.onClose.bind(this));
    }

    private onReadable() {
        // Noop
    }

    readable(): Promise<boolean> {
        return new Promise(res => {
            // Unneeded, apparently node is smart and knows when to ignore if the stream is closed!
            //
            // if (this.closed) {
            //     console.log('Stream is closed');
            //     res(false);
            //     return;
            // }

            // this.stream.once('closed', () => {
            //     console.log('Closed');
            //     res(false);
            // });

            this.stream.once('readable', () => {
                // console.log('Received new buffer');
                res(true);
            });
        });
    }

    private onClose() {
        console.log('Stream closed');
        this.closed = true;
    }

    async read(byteCount: number): Promise<Buffer> {
        if (byteCount === 0) return Buffer.alloc(0);
        let buffer;

        do {
            buffer = this.stream.read(byteCount);
        } while (buffer === null && await this.readable())

        this.offset += byteCount;

        if (buffer === null) {
            if (this.closed) {
                throw new Error('Attempted to read while stream closed');
            } else {
                throw new Error('Uncaught error.');
            }
        }

        return buffer;
    }

    async readByte(): Promise<number> {
        const buffer = await this.read(1);
        return buffer[0];
    }

    async readBoolean(): Promise<boolean> {
        const byte = await this.readByte();

        return byte !== 0;
    }

    // Reads a 7 bit encoded integer
    async read7BitEncodedInt() {
        let int = 0;

        while (true) {
            const byte = await this.readByte();

            int += byte & 0b111111;

            if ((byte & 0b10000000) === 0) {
                break;
            }

            int <<= 7;
        }

        return int;
    }

    // Reads a string encoded as
    // 7 bit integer denoting the string length
    // all bytes composing the string, from the 7 bit int
    async readString(len?: number, encoding = 'utf8') {
        const strlen = len || await this.read7BitEncodedInt();
        const buffer = await this.read(strlen);

        return buffer.toString(encoding);
    }

    // Signed integers

    async readInt8() {
        const buffer = await this.read(1);

        return buffer.readInt8(0);
    }

    async readInt16BE() {
        const buffer = await this.read(2);

        return buffer.readInt16BE(0);
    }

    async readInt16LE() {
        const buffer = await this.read(2);

        return buffer.readInt16LE(0);
    }

    async readInt32BE() {
        const buffer = await this.read(4);

        return buffer.readInt32BE(0);
    }

    async readInt32LE() {
        const buffer = await this.read(4);

        return buffer.readInt32LE(0);
    }

    // Big signed integers

    async readBigInt64BE() {
        const buffer = await this.read(8);

        return buffer.readBigInt64BE(0);
    }

    async readBigInt64LE() {
        const buffer = await this.read(8);

        return buffer.readBigInt64LE(0);
    }

    // Arbitrary length signed integers

    async readIntBE(byteLength: number) {
        const buffer = await this.read(byteLength);

        return buffer.readIntBE(0, byteLength);
    }

    async readIntLE(byteLength: number) {
        const buffer = await this.read(byteLength);

        return buffer.readIntLE(0, byteLength);
    }

    // Unsigned integers

    async readUInt8() {
        const buffer = await this.read(1);

        return buffer.readUInt8(0);
    }

    async readUInt16BE() {
        const buffer = await this.read(2);

        return buffer.readUInt16BE(0);
    }

    async readUInt16LE() {
        const buffer = await this.read(2);

        return buffer.readUInt16LE(0);
    }

    async readUInt32BE() {
        const buffer = await this.read(4);

        return buffer.readUInt32BE(0);
    }

    async readUInt32LE() {
        const buffer = await this.read(4);

        return buffer.readUInt32LE(0);
    }

    // Big unsigned integers

    async readBigUInt64BE() {
        const buffer = await this.read(8);

        return buffer.readBigUInt64BE(0);
    }

    async readBigUInt64LE() {
        const buffer = await this.read(8);

        return buffer.readBigUInt64LE(0);
    }

    // Arbitrary length unsigned integers

    async readUIntBE(byteLength: number) {
        const buffer = await this.read(byteLength);

        return buffer.readUIntBE(0, byteLength);
    }

    async readUIntLE(byteLength: number) {
        const buffer = await this.read(byteLength);

        return buffer.readUIntLE(0, byteLength);
    }

    // Floating point numbers

    async readFloatBE() {
        const buffer = await this.read(4);

        return buffer.readDoubleLE(0);
    }

    async readFloatLE() {
        const buffer = await this.read(4);

        return buffer.readFloatLE(0);
    }

    // Double precision floating point numbers

    async readDoubleBE() {
        const buffer = await this.read(8);

        return buffer.readDoubleBE(0);
    }

    async readDoubleLE() {
        const buffer = await this.read(8);

        return buffer.readDoubleLE(0);
    }
}
