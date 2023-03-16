"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_hex_prefixed_1 = __importDefault(require("./is-hex-prefixed"));
const stripHexPrefix = (s) => ((0, is_hex_prefixed_1.default)(s) ? s.substr(2) : s);
exports.default = stripHexPrefix;
//# sourceMappingURL=strip-hex-prefix.js.map