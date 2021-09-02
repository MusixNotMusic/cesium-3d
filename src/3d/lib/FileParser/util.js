/**
 * buffer 转换 utf8
 * @param {*} buffer 
 * @returns 
 */
export function bufferToUTF8(buffer) {
   return new TextDecoder('utf-8').decode(deleteSpaceTabSymbol(buffer))
}

export function bufferToGB2312(buffer) {
    return new TextDecoder('gb2312').decode(deleteSpaceTabSymbol(buffer))
 }

function deleteSpaceTabSymbol (buffer) {
    const index = buffer.findIndex(item => {
        return item === 0
    });
    if (index !== -1)  {
        buffer = buffer.slice(0, index);
    }
    return buffer;
}