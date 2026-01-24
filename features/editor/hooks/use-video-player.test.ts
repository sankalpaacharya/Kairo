import { describe, it, expect } from "bun:test";
import { formatTime } from "./use-video-player";

describe("formatTime function", () => {
    describe("valid duration formatting", () => {
        it("should format 0 seconds as 00:00", () => {
            expect(formatTime(0)).toBe("00:00");
        });

        it("should format 30 seconds as 00:30", () => {
            expect(formatTime(30)).toBe("00:30");
        });

        it("should format 65 seconds as 01:05", () => {
            // 65 seconds = 1 minute and 5 seconds
            expect(formatTime(65)).toBe("01:05");
        });

        it("should format 3661 seconds as 61:01", () => {
            // 3661 seconds = 61 minutes and 1 second
            expect(formatTime(3661)).toBe("61:01");
        });

        it("should format 59 seconds as 00:59", () => {
            expect(formatTime(59)).toBe("00:59");
        });

        it("should format 60 seconds as 01:00", () => {
            expect(formatTime(60)).toBe("01:00");
        });

        it("should format 3600 seconds as 60:00", () => {
            // 1 hour = 60 minutes
            expect(formatTime(3600)).toBe("60:00");
        });
    });

    describe("invalid input handling", () => {
        it("should return 00:00 for NaN", () => {
            expect(formatTime(NaN)).toBe("00:00");
        });

        it("should return 00:00 for Infinity", () => {
            expect(formatTime(Infinity)).toBe("00:00");
        });

        it("should return 00:00 for negative Infinity", () => {
            expect(formatTime(-Infinity)).toBe("00:00");
        });

        it("should return 00:00 for negative values", () => {
            expect(formatTime(-1)).toBe("00:00");
            expect(formatTime(-30)).toBe("00:00");
            expect(formatTime(-100)).toBe("00:00");
        });
    });

    describe("edge cases", () => {
        it("should handle decimal seconds by flooring", () => {
            expect(formatTime(30.7)).toBe("00:30");
            expect(formatTime(65.9)).toBe("01:05");
        });

        it("should handle very large durations", () => {
            expect(formatTime(86400)).toBe("1440:00"); // 24 hours
            expect(formatTime(359999)).toBe("5999:59"); // Just under 100 hours
        });
    });
});
