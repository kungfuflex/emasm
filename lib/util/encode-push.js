"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const add_hex_prefix_1 = __importDefault(require("./add-hex-prefix"));
const left_zero_pad_to_byte_length_1 = __importDefault(require("./left-zero-pad-to-byte-length"));
const ops_json_1 = __importDefault(require("../ops.json"));
const encodePush = (v, length) => {
    const baseOffset = Number((0, add_hex_prefix_1.default)(ops_json_1.default.push));
    const opcodeValue = baseOffset + length - 1;
    return (opcodeValue.toString(16) + (0, left_zero_pad_to_byte_length_1.default)(v.toString(16), length));
};
exports.default = encodePush;
//# sourceMappingURL=encode-push.js.map