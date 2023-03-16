"use strict";

import addHexPrefix from "./add-hex-prefix";
import leftZeroPadToByteLength from "./left-zero-pad-to-byte-length";
import ops from "../ops.json";

const encodePush = (v, length) => {
  const baseOffset = Number(addHexPrefix(ops.push));
  const opcodeValue = baseOffset + length - 1;
  return (
    opcodeValue.toString(16) + leftZeroPadToByteLength(v.toString(16), length)
  );
};

export default encodePush;
