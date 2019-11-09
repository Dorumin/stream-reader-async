# stream-reader-async
Wraps a readable stream with a bunch of helper buffer-like methods that can be used asynchronously with async/await.

This results in an interesting blend between streams, buffers and promises that's very useful when parsing binary data.

The reader position is updated along with how many bytes you read.

# API Reference
## AsyncStreamReader(stream)
Constructs a new stream reader from a stream.

### closed
Returns whether the stream has finished reading. This property may be removed in a future release.

### read(byteCount)
Returns a new buffer of size `byteCount` and advances the stream position that same amount.

### readByte()
Returns the next byte and advances the stream position by one. Equal to calling `read(1)[0]`

### read7BitEncodedInt()
Reads a 7-bit encoded integer. This is not the same as a varint, as the order is not reversed before the final binary is added.

A byte is read, if its most significant bit is a 1, there is another byte to be consumed. The other 7 bits are added to the number.

```js
1111111 11100010 11111011 01110101
 111111  1100010  1111011  1110101

111111110001011110111110101 // 133742069
```

### readString(strlen, encoding = utf8)
Reads a string of `strlen`. Both parameters are optional. The default encoding is `utf8`.

If you omit `strlen`, a first 7-bit integer wil be read, and it will be used as the string length to return.

### Buffer methods
These methods behave exactly how Node Buffers would, except they return a promise, and don't require an offset as it will always be zero.

#### readInt8()
#### readInt16BE() / readInt16LE()
#### readInt32BE() / readInt32LE()
#### readBigInt64BE() / readBigInt64LE()
#### readIntBE(byteLength) / readIntLE(byteLength)

#### readUInt8()
#### readUInt16BE() / readUInt16LE()
#### readUInt32BE() / readUInt32LE()
#### readBigUInt64BE() / readBigUInt64LE()
#### readUIntBE(byteLength) / readUIntLE(byteLength)

#### readDoubleBE() / readDoubleLE()
#### readFloatBE() / readFloatLE()
