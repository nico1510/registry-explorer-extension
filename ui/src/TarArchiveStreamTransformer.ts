export interface FileInfo {
  path: string;
  type: string;
  size: number;
  mtime: number;
}

export class TarArchiveStreamTransformer {
  decoder = new TextDecoder();
  totalBytes = 0;
  totalOffset = 0;
  remainingChunk: Uint8Array | null = null;

  #readFileName(chunk: Uint8Array, offset: number) {
    let strView = new Uint8Array(chunk.buffer, offset, 100);
    let i = strView.indexOf(0);
    return this.decoder.decode(strView.slice(0, i));
  }

  #readFileType(chunk: Uint8Array, offset: number) {
    let typeView = new DataView(chunk.buffer, offset + 156, 1);
    let typeStr = this.decoder.decode(typeView);
    if (typeStr == "0") {
      return "file";
    } else if (typeStr == "5") {
      return "directory";
    } else {
      return typeStr;
    }
  }

  #readFileSize(chunk: Uint8Array, offset: number) {
    let szStr = this.decoder
      .decode(new DataView(chunk.buffer, offset + 124, 12))
      .substring(0, 11);
    return parseInt(szStr, 8);
  }

  #readMTime(chunk: Uint8Array, offset: number) {
    let szStr = this.decoder
      .decode(new DataView(chunk.buffer, offset + 136, 12))
      .substring(0, 11);
    return parseInt(szStr, 8);
  }

  /**
   * Receives the next Uint8Array chunk from `fetch` and transforms it.
   *
   * @param {Uint8Array} chunk The next binary data chunk.
   * @param {TransformStreamDefaultController} controller The controller to enqueue the transformed chunks to.
   */
  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<FileInfo>
  ) {
    // we restore the chunk from the previous iteration and pretend we have received it as part of the current chunk
    let newChunk = chunk;
    if (this.remainingChunk) {
      newChunk = new Uint8Array(this.remainingChunk.length + chunk.length);
      newChunk.set(this.remainingChunk);
      newChunk.set(chunk, this.remainingChunk.length);
      this.remainingChunk = null;
    }

    while (this.totalOffset < this.totalBytes + newChunk.byteLength) {
      const offset = this.totalOffset - this.totalBytes;

      if (offset + 512 >= newChunk.byteLength) {
        // we won't be able to read the header of the next file, so we save the remaining chunk for the next iteration
        this.remainingChunk = newChunk.slice(offset);
        break;
      }

      const name = this.#readFileName(newChunk, offset);
      const type = this.#readFileType(newChunk, offset);
      const size = this.#readFileSize(newChunk, offset);
      const mtime = this.#readMTime(newChunk, offset);

      if (isNaN(size)) {
        break;
      }

      this.totalOffset += 512 + 512 * Math.trunc(size / 512);
      if (size % 512) {
        this.totalOffset += 512;
      }

      controller.enqueue({ path: name, type, size, mtime });
    }

    // we pretend that we have never read the remaining chunk if there is one (it will be read in the next iteration)
    this.totalBytes += newChunk.byteLength - (this.remainingChunk?.length ?? 0);
  }
}
