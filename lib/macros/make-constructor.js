"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emasm_1 = require("../emasm");
exports.default = (ary) => [
    "bytes:runtime-code:size",
    "dup1",
    "bytes:runtime-code:ptr",
    "0x0",
    "codecopy",
    "0x0",
    "return",
    ["bytes:runtime-code", [(0, emasm_1.emasm)(ary)]],
];
//# sourceMappingURL=make-constructor.js.map