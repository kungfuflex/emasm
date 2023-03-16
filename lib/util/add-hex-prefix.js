"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addHexPrefix = (s) => (s.substr(0, 2) === "0x" ? s : "0x" + s);
exports.default = addHexPrefix;
//# sourceMappingURL=add-hex-prefix.js.map