"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const leftZeroPadToByteLength = (s, n) => {
    if (typeof s === "number")
        s = s.toString(16);
    return Array(n * 2 - s.length + 1).join("0") + s;
};
exports.default = leftZeroPadToByteLength;
//# sourceMappingURL=left-zero-pad-to-byte-length.js.map