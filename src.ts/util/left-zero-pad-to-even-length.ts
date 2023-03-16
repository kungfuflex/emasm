"use strict";

const leftZeroPadToEvenLength = (s) => (s.length % 2 === 0 ? s : "0" + s);

export default leftZeroPadToEvenLength;
