"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var stream_1 = require("stream");
var CMX3600Parser_js_1 = __importDefault(require("../lib/CMX3600Parser.js"));
function getBasicStream(contents) {
    if (Array.isArray(contents)) {
        return new stream_1.Readable({
            read: function () {
                var _this = this;
                contents.forEach(function (line) { return _this.push(line); });
                this.push(null);
            },
        });
    }
    return new stream_1.Readable({
        read: function () {
            this.push(contents);
            this.push(null);
        },
    });
}
function generateEvent() {
    return getBasicStream('003  BOONE_SM V     C        01:01:43:05 01:01:57:00 01:00:07:26 01:00:21:21');
}
function generateAudioEvent() {
    return getBasicStream('004  BFD_CHIL A10   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');
}
function generateAudioVideoEvent() {
    return getBasicStream('004  BFD_CHIL AA/V   C        01:00:01:05 01:00:02:05 01:00:11:19 01:00:12:19 ');
}
function generateEventWithComments() {
    return getBasicStream([
        '002  EVL1_ESC V     C        06:00:02:01 06:00:07:12 01:00:00:25 01:00:01:16 ',
        'M2   EVL1_ESC       108.5                06:00:02:01 ',
        '* GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATR ',
        '* AZ ISLAND _622-21 ',
        '* FROM CLIP NAME:  QEVL1ESCP001.NEW.01',
    ]);
}
function generateEventwithSourceFile() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          059.6                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
function generateEventwithTransition() {
    return getBasicStream([
        '000002  AX       V     D    024 00:00:00:10 00:00:02:14 01:01:25:10 01:01:27:14',
        'EFFECTS NAME IS CROSS DISSOLVE',
        '* FROM CLIP NAME: Clip_01.mov',
        '* TO CLIP NAME: Clip_02.mov',
    ]);
}
function generateEventwithMotionEffect() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          059.6                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
function generateEventwithMotionEffectwithNegativeSpeed() {
    return getBasicStream([
        '006  AQ100    V     C        00:02:18:05 00:02:28:10 01:00:26:10 01:00:31:13 ',
        'M2   AQ100          -092.8                00:02:18:05 ',
        '* TIMEWARP EFFECT AT SEQUENCE TC 01;00;26;10. ',
        '* FROM CLIP NAME:  DTB RE EDIT - HD 720P VIDEO SHARING.NEW.01 ',
        '* SOURCE FILE: DTB RE EDIT - HD 720P VIDEO SHARING',
    ]);
}
describe('CMX3600Parser', function () {
    describe('Events', function () {
        it('piping CMX 3600 string should parse to Event properties', function (done) {
            var input = generateEvent();
            var output = new CMX3600Parser_js_1.default();
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.notStrictEqual(results[0], undefined, 'Results array is empty');
                assert_1.default.strictEqual(results[0].number, 3, 'Number was not set.');
                assert_1.default.strictEqual(results[0].reel, 'BOONE_SM', 'Reel was not set.');
                assert_1.default.strictEqual(results[0].trackType, 'V', 'Track type was not set.');
                assert_1.default.strictEqual(results[0].transition, 'C', 'Transition was not set.');
                if (results[0].sourceStart) {
                    assert_1.default.deepStrictEqual(results[0].sourceStart, { hours: 1, minutes: 1, seconds: 43, frames: 5, frameRate: 29.97 });
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Source Start was not set.');
                }
                if (results[0].sourceEnd) {
                    assert_1.default.deepStrictEqual(results[0].sourceEnd, { hours: 1, minutes: 1, seconds: 57, frames: 0, frameRate: 29.97 });
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Source End was not set.');
                }
                if (results[0].recordStart) {
                    assert_1.default.deepStrictEqual(results[0].recordStart, { hours: 1, minutes: 0, seconds: 7, frames: 26, frameRate: 29.97 });
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Record Start was not set.');
                }
                if (results[0].recordEnd) {
                    assert_1.default.deepStrictEqual(results[0].recordEnd, { hours: 1, minutes: 0, seconds: 21, frames: 21, frameRate: 29.97 });
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Record End was not set.');
                }
                done();
            });
            input.pipe(output);
        });
        it('piping CMX 3600 string should split track to type and number', function (done) {
            var input = generateAudioEvent();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].trackType, 'A');
                assert_1.default.strictEqual(results[0].trackNumber, 10);
                done();
            });
        });
        it('piping CMX 3600 string should parse audio video tracks', function (done) {
            var input = generateAudioVideoEvent();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].trackType, 'AA/V');
                done();
            });
        });
    });
    describe('Comments', function () {
        it('piping CMX 3600 string should parse "* SOURCE FILE:" to a sourceFile property on Event', function (done) {
            var input = generateEventwithSourceFile();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].sourceFile, 'DTB RE EDIT - HD 720P VIDEO SHARING');
                done();
            });
        });
        it('piping CMX 3600 string should parse "* FROM CLIP NAME:" to a sourceClip property on Event', function (done) {
            var input = generateEventWithComments();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].sourceClip, 'QEVL1ESCP001.NEW.01');
                done();
            });
        });
        it('piping CMX 3600 string should parse "* Misc" to a comment property to Event', function (done) {
            var input = generateEventWithComments();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].comment, 'GETTY__QEVL1ESCP001_GREAT ESCAPES_MECKLENBURG SIX_AERIAL AROUND PRISON ON ALCATRAZ ISLAND _622-21');
                done();
            });
        });
        it('piping CMX 3600 string should parse "* TO CLIP NAME:" to transtionTo property', function (done) {
            var input = generateEventwithTransition();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                assert_1.default.strictEqual(results[0].toClip, 'Clip_02.mov');
                done();
            });
        });
    });
    describe('Motion Effects', function () {
        it('Should get a reel', function (done) {
            var input = generateEventwithMotionEffect();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert_1.default.strictEqual(results[0].motionEffect.reel, 'AQ100');
                    }
                    else {
                        assert_1.default.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should get speed as a float', function (done) {
            var input = generateEventwithMotionEffect();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert_1.default.strictEqual(results[0].motionEffect.speed, 59.6);
                    }
                    else {
                        assert_1.default.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should correctly parse a negative speed', function (done) {
            var input = generateEventwithMotionEffectwithNegativeSpeed();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert_1.default.strictEqual(results[0].motionEffect.speed, -92.8);
                    }
                    else {
                        assert_1.default.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
        it('Should get entryPoint as a Timecode object', function (done) {
            var input = generateEventwithMotionEffect();
            var output = new CMX3600Parser_js_1.default();
            input.pipe(output);
            var results = [];
            output.on('data', function (data) { return results.push(data); });
            output.on('end', function () {
                if (results[0]) {
                    if (results[0].motionEffect) {
                        assert_1.default.strictEqual(results[0].motionEffect.reel, 'AQ100');
                        assert_1.default.strictEqual(results[0].motionEffect.entryPoint.toString(), '00:02:18;05');
                    }
                    else {
                        assert_1.default.strictEqual(true, false, 'MotionEffect is undefined');
                    }
                }
                else {
                    assert_1.default.strictEqual(true, false, 'Events array is empty.');
                }
                done();
            });
        });
    });
});
