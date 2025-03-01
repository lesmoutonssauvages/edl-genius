"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var timecode_boss_1 = __importDefault(require("timecode-boss"));
var MotionEffect_js_1 = __importDefault(require("../lib/MotionEffect.js"));
describe('Motion Effect', function () {
    it('Should deep copy a MotionEffect passed to the constructor', function () {
        var firstMotionEffect = new MotionEffect_js_1.default({
            reel: 'KIRA_PAS',
            speed: 24.5,
            entryPoint: {
                hours: 1,
                minutes: 1,
                seconds: 25,
                frames: 14,
                frameRate: 29.97,
            },
        });
        var secondMotionEffect = new MotionEffect_js_1.default(firstMotionEffect);
        firstMotionEffect.reel = '';
        firstMotionEffect.speed = 0;
        firstMotionEffect.entryPoint = new timecode_boss_1.default(0);
        assert_1.default.strictEqual(secondMotionEffect.reel, 'KIRA_PAS');
        assert_1.default.strictEqual(secondMotionEffect.speed, 24.5);
        assert_1.default.strictEqual(secondMotionEffect.entryPoint.toString(), '01:01:25;14');
    });
});
