"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const is_hex_prefixed_1 = __importDefault(require("./is-hex-prefixed"));
const strip_hex_prefix_1 = __importDefault(require("./strip-hex-prefix"));
const coerceToBN = (n) => {
    switch (typeof n) {
        case "number":
            return new bn_js_1.default(n);
        case "string":
            if ((0, is_hex_prefixed_1.default)(n))
                return new bn_js_1.default((0, strip_hex_prefix_1.default)(n), 16);
            return new bn_js_1.default(n);
        default:
            throw Error("Invalid argument to coerceToBN: " + n);
    }
};
exports.default = coerceToBN;
//# sourceMappingURL=coerce-to-bn.js.map