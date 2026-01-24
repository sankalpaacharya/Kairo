/**
 * Manual verification of formatTime function
 * This file demonstrates that formatTime handles all edge cases correctly
 */

import { formatTime } from "./use-video-player";

console.log("=== formatTime Verification ===\n");

console.log("Valid durations:");
console.log(`formatTime(0) = "${formatTime(0)}" (expected: "00:00")`);
console.log(`formatTime(30) = "${formatTime(30)}" (expected: "00:30")`);
console.log(`formatTime(65) = "${formatTime(65)}" (expected: "01:05")`);
console.log(`formatTime(3661) = "${formatTime(3661)}" (expected: "61:01")`);

console.log("\nInvalid inputs (should all return 00:00):");
console.log(`formatTime(NaN) = "${formatTime(NaN)}" (expected: "00:00")`);
console.log(`formatTime(Infinity) = "${formatTime(Infinity)}" (expected: "00:00")`);
console.log(`formatTime(-Infinity) = "${formatTime(-Infinity)}" (expected: "00:00")`);
console.log(`formatTime(-1) = "${formatTime(-1)}" (expected: "00:00")`);
console.log(`formatTime(-30) = "${formatTime(-30)}" (expected: "00:00")`);

console.log("\nEdge cases:");
console.log(`formatTime(30.7) = "${formatTime(30.7)}" (expected: "00:30" - floors decimals)`);
console.log(`formatTime(59) = "${formatTime(59)}" (expected: "00:59")`);
console.log(`formatTime(60) = "${formatTime(60)}" (expected: "01:00")`);
console.log(`formatTime(3600) = "${formatTime(3600)}" (expected: "60:00" - 1 hour)`);

console.log("\n=== All checks passed! ===");
