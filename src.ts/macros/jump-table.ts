"use strict";

export default (jumpTableLabel, labels, size = 32) => [
  "bytes:" + jumpTableLabel,
  labels.map((label) => [size, label]),
];
