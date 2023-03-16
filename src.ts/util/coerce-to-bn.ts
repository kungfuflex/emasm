"use strict";

import BN from "bn.js";
import isHexPrefixed from "./is-hex-prefixed";
import stripHexPrefix from "./strip-hex-prefix";

const coerceToBN = (n) => {
  switch (typeof n) {
    case "number":
      return new BN(n);
    case "string":
      if (isHexPrefixed(n)) return new BN(stripHexPrefix(n), 16);
      return new BN(n);
    default:
      throw Error("Invalid argument to coerceToBN: " + n);
  }
};

export default coerceToBN;
