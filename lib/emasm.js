"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emasm = void 0;
const ops_json_1 = __importDefault(require("./ops.json"));
const BN = require("bn.js");
const util_1 = require("./util");
const isLabel = (s) => isNaN(s) && !ops_json_1.default[s] && !Array.isArray(s);
const isBytesLabel = (s) => s.substr(0, 6) === "bytes:";
const pushBytes = (r, bytes) => {
    const partial = r.labels[r.currentLabel];
    partial[partial.length - 1] += bytes;
    return r;
};
const pushLabel = (r, label) => {
    const partial = r.labels[r.currentLabel];
    partial.push(label);
    partial.push("");
    return r;
};
const initialSegmentSymbol = Symbol("@@initial");
const firstPass = (ast, progress = {
    labels: {},
    segmentOrder: [],
    bytesLabels: {},
    bytesPtrLabels: {},
    bytesSizeLabels: {},
    jumpdestLabels: {},
}) => ast.reduce((r, v, i, ary) => {
    r = r || progress;
    if (!r.labels[initialSegmentSymbol]) {
        r.labels[initialSegmentSymbol] = Object.assign([""], { sizeof: 2 });
        r.jumpdestLabels[initialSegmentSymbol] = Object.assign([], { sizeof: 2 });
        r.segmentOrder.push(initialSegmentSymbol);
        r.currentLabel = initialSegmentSymbol;
    }
    if (r.parsingBytesLabel) {
        r.bytesPtrLabels[r.parsingBytesLabel + ":ptr"] = Object.assign([], {
            sizeof: 2,
        });
        r.bytesSizeLabels[r.parsingBytesLabel + ":size"] = Object.assign([], {
            sizeof: 2,
        });
        r.bytesLabels[r.parsingBytesLabel] = Object.assign([], { sizeof: 2 });
        r.labels[r.parsingBytesLabel] = v.map((raw) => typeof raw === "string" && raw.substr(0, 2) === "0x"
            ? (0, util_1.leftZeroPadToEvenLength)((0, util_1.stripHexPrefix)(raw))
            : Array.isArray(raw)
                ? [
                    raw[0],
                    typeof raw[1] === "string" && raw[1].substr(0, 2) === "0x"
                        ? (0, util_1.leftZeroPadToEvenLength)((0, util_1.stripHexPrefix)(raw[1]))
                        : raw[1],
                ]
                : raw);
        delete r.parsingBytesLabel;
        return r;
    }
    if (r.parsingLabel) {
        r.jumpdestLabels[r.parsingLabel] = true;
        delete r.parsingLabel;
        return firstPass(v, r);
    }
    if (Array.isArray(v))
        return firstPass(v, r);
    if (isLabel(v)) {
        if (!i && Array.isArray(ary[i + 1])) {
            if (isBytesLabel(v)) {
                r.segmentOrder.push(v);
                r.parsingBytesLabel = v;
                return r;
            }
            r.labels[v] = Object.assign([ops_json_1.default.jumpdest], { sizeof: 2 });
            r.segmentOrder.push(v);
            r.currentLabel = v;
            r.parsingLabel = v;
            return r;
        }
        return pushLabel(r, v);
    }
    if (!isNaN(v)) {
        const bn = (0, util_1.coerceToBN)(v);
        const length = bn.byteLength() || 1;
        if (length > 32)
            throw Error("constant integer overflow: " + v);
        return pushBytes(r, (0, util_1.encodePush)(bn, length));
    }
    const op = ops_json_1.default[v];
    if (!op)
        throw Error("opcode not found: " + v);
    return pushBytes(r, op);
}, null);
const compact = (meta) => {
    let rerun = false;
    const { bytesPtrLabels, labels, bytesSizeLabels } = meta;
    Object.keys(bytesPtrLabels).forEach((label) => {
        const byteLength = new BN(bytesPtrLabels[label].value).byteLength() || 1;
        if (byteLength < bytesPtrLabels[label].sizeof) {
            bytesPtrLabels[label].sizeof = byteLength;
            rerun = true;
        }
    });
    Object.keys(labels).forEach((label) => {
        if (!labels[label].sizeof)
            return;
        const byteLength = new BN(labels[label].value).byteLength() || 1;
        if (byteLength < labels[label].sizeof) {
            labels[label].sizeof = byteLength;
            rerun = true;
        }
    });
    Object.keys(bytesSizeLabels).forEach((label) => {
        const byteLength = new BN(bytesSizeLabels[label].size).byteLength() || 1;
        if (byteLength < bytesSizeLabels[label].sizeof) {
            bytesSizeLabels[label].sizeof = byteLength;
            rerun = true;
        }
    });
    if (rerun) {
        annotateWithSizes(meta);
        return compact(meta);
    }
    return meta;
};
const annotateWithSizes = ({ labels, bytesLabels, bytesPtrLabels, bytesSizeLabels, jumpdestLabels, segmentOrder, }) => {
    let total = 0;
    segmentOrder.forEach((label) => {
        if (jumpdestLabels[label]) {
            labels[label].value = total;
            labels[label].forEach((partial) => {
                if (labels[partial])
                    total += labels[partial].sizeof + 1;
                else if (bytesPtrLabels[partial])
                    total += bytesPtrLabels[partial].sizeof + 1;
                else if (bytesSizeLabels[partial])
                    total += bytesSizeLabels[partial].sizeof + 1;
                else
                    total += partial.length / 2;
            });
        }
        if (bytesLabels[label]) {
            let start = total;
            bytesPtrLabels[label + ":ptr"].value = total;
            labels[label].forEach((partial) => {
                if (Array.isArray(partial))
                    total += partial[0];
                else if (labels[partial])
                    total += labels[partial].sizeof;
                else if (bytesPtrLabels[partial])
                    total += labels[partial].sizeof;
                else if (bytesSizeLabels[partial])
                    total += bytesSizeLabels[partial].sizeof;
                else
                    total += partial.length / 2;
            });
            bytesSizeLabels[label + ":size"].size = total - start;
        }
    });
};
const encodeDynamicSlots = ({ bytesPtrLabels, bytesSizeLabels, bytesLabels, segmentOrder, jumpdestLabels, labels, }) => {
    segmentOrder.forEach((v) => {
        if (!labels[v])
            return;
        if (jumpdestLabels[v])
            labels[v].forEach((partial, i, ary) => {
                if (bytesPtrLabels[partial])
                    ary[i] = (0, util_1.encodePush)(bytesPtrLabels[partial].value, bytesPtrLabels[partial].sizeof);
                else if (bytesSizeLabels[partial])
                    ary[i] = (0, util_1.encodePush)(bytesSizeLabels[partial].size, bytesSizeLabels[partial].sizeof);
                else if (jumpdestLabels[partial])
                    ary[i] = (0, util_1.encodePush)(labels[partial].value, labels[partial].sizeof);
            });
        if (bytesLabels[v])
            labels[v].forEach((partial, i, ary) => {
                if (Array.isArray(partial)) {
                    if (bytesPtrLabels[partial[1]])
                        ary[i] = (0, util_1.leftZeroPadToByteLength)(bytesPtrLabels[partial[1]].value, partial[0]);
                    else if (bytesSizeLabels[partial[1]])
                        ary[i] = (0, util_1.leftZeroPadToByteLength)(bytesSizeLabels[partial[0]].size, partial[0]);
                    else if (labels[partial[1]])
                        ary[i] = (0, util_1.leftZeroPadToByteLength)(labels[partial[1]].value, partial[0]);
                    else
                        ary[i] = (0, util_1.leftZeroPadToByteLength)(partial[1], partial[0]);
                }
                else if (bytesPtrLabels[partial])
                    ary[i] = (0, util_1.leftZeroPadToByteLength)(bytesPtrLabels[partial].value, bytesPtrLabels[partial].sizeof);
                else if (bytesSizeLabels[partial])
                    ary[i] = (0, util_1.leftZeroPadToByteLength)(bytesSizeLabels[partial].size, bytesSizeLabels[partial].sizeof);
                else if (labels[partial])
                    ary[i] = (0, util_1.leftZeroPadToByteLength)(labels[partial].value, labels[partial].sizeof);
            });
    });
};
const emasm = (ast) => {
    const meta = firstPass(ast);
    annotateWithSizes(meta);
    compact(meta);
    encodeDynamicSlots(meta);
    const { labels, segmentOrder } = meta;
    return (0, util_1.addHexPrefix)(segmentOrder.map((v) => labels[v].join("")).join(""));
};
exports.emasm = emasm;
//# sourceMappingURL=emasm.js.map