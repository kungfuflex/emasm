"use strict";

import { emasm } from "../emasm";

export default (ary) => [
  "bytes:runtime-code:size",
  "dup1",
  "bytes:runtime-code:ptr",
  "0x0",
  "codecopy",
  "0x0",
  "return",
  ["bytes:runtime-code", [emasm(ary)]],
];
