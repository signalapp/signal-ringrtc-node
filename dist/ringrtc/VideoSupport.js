"use strict";
//
// Copyright 2019-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasVideoRenderer = exports.MAX_VIDEO_CAPTURE_BUFFER_SIZE = exports.MAX_VIDEO_CAPTURE_AREA = exports.MAX_VIDEO_CAPTURE_HEIGHT = exports.MAX_VIDEO_CAPTURE_WIDTH = exports.GumVideoCapturer = exports.GumVideoCaptureOptions = void 0;
class GumVideoCaptureOptions {
    constructor() {
        this.maxWidth = 640;
        this.maxHeight = 480;
        this.maxFramerate = 30;
    }
}
exports.GumVideoCaptureOptions = GumVideoCaptureOptions;
class GumVideoCapturer {
    constructor(defaultCaptureOptions) {
        this.defaultCaptureOptions = defaultCaptureOptions;
    }
    capturing() {
        return this.captureOptions != undefined;
    }
    setLocalPreview(localPreview) {
        var _a;
        const oldLocalPreview = (_a = this.localPreview) === null || _a === void 0 ? void 0 : _a.current;
        if (oldLocalPreview) {
            oldLocalPreview.srcObject = null;
        }
        this.localPreview = localPreview;
        this.updateLocalPreviewSourceObject();
    }
    enableCapture() {
        // tslint:disable no-floating-promises
        this.startCapturing(this.defaultCaptureOptions);
    }
    enableCaptureAndSend(sender, options) {
        // tslint:disable no-floating-promises
        this.startCapturing(options !== null && options !== void 0 ? options : this.defaultCaptureOptions);
        this.startSending(sender);
    }
    disable() {
        this.stopCapturing();
        this.stopSending();
    }
    setPreferredDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.preferredDeviceId = deviceId;
            if (this.captureOptions) {
                const captureOptions = this.captureOptions;
                const sender = this.sender;
                this.disable();
                this.startCapturing(captureOptions);
                if (sender) {
                    this.startSending(sender);
                }
            }
        });
    }
    enumerateDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield window.navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind == 'videoinput');
            return cameras;
        });
    }
    getUserMedia(options) {
        var _a;
        // TODO: Figure out a better way to make typescript accept "mandatory".
        let constraints = {
            audio: false,
            video: {
                deviceId: (_a = options.preferredDeviceId) !== null && _a !== void 0 ? _a : this.preferredDeviceId,
                width: {
                    max: options.maxWidth,
                },
                height: {
                    max: options.maxHeight,
                },
                frameRate: {
                    max: options.maxFramerate,
                },
            },
        };
        if (options.screenShareSourceId != undefined) {
            constraints.video = {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: options.screenShareSourceId,
                    maxWidth: options.maxWidth,
                    maxHeight: options.maxHeight,
                    maxFrameRate: options.maxFramerate,
                },
            };
        }
        return window.navigator.mediaDevices.getUserMedia(constraints);
    }
    startCapturing(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.capturing()) {
                return;
            }
            this.captureOptions = options;
            this.capturingStartTime = Date.now();
            try {
                // If we start/stop/start, we may have concurrent calls to getUserMedia,
                // which is what we want if we're switching from camera to screenshare.
                // But we need to make sure we deal with the fact that things might be
                // different after the await here.
                const mediaStream = yield this.getUserMedia(options);
                // It's possible video was disabled, switched to screenshare, or
                // switched to a different camera while awaiting a response, in
                // which case we need to disable the camera we just accessed.
                if (this.captureOptions != options) {
                    for (const track of mediaStream.getVideoTracks()) {
                        // Make the light turn off faster
                        track.stop();
                    }
                    return;
                }
                this.mediaStream = mediaStream;
                this.updateLocalPreviewSourceObject();
            }
            catch (e) {
                // It's possible video was disabled, switched to screenshare, or
                // switched to a different camera while awaiting a response, in
                // which case we should reset the captureOptions if we set them.
                if (this.captureOptions == options) {
                    // We couldn't open the camera.  Oh well.
                    this.captureOptions = undefined;
                }
            }
        });
    }
    stopCapturing() {
        if (!this.capturing()) {
            return;
        }
        this.captureOptions = undefined;
        if (!!this.mediaStream) {
            for (const track of this.mediaStream.getVideoTracks()) {
                // Make the light turn off faster
                track.stop();
            }
            this.mediaStream = undefined;
        }
        this.updateLocalPreviewSourceObject();
    }
    startSending(sender) {
        if (this.sender === sender) {
            return;
        }
        if (!!this.sender) {
            // If we're replacing an existing sender, make sure we stop the
            // current setInterval loop before starting another one.
            this.stopSending();
        }
        this.sender = sender;
        this.canvas = new OffscreenCanvas(this.captureOptions.maxWidth, this.captureOptions.maxHeight);
        this.canvasContext = this.canvas.getContext('2d') || undefined;
        const interval = 1000 / this.captureOptions.maxFramerate;
        this.intervalId = setInterval(this.captureAndSendOneVideoFrame.bind(this), interval);
    }
    stopSending() {
        this.sender = undefined;
        this.canvas = undefined;
        this.canvasContext = undefined;
        if (!!this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    updateLocalPreviewSourceObject() {
        if (!this.localPreview) {
            return;
        }
        const localPreview = this.localPreview.current;
        if (!localPreview) {
            return;
        }
        const { mediaStream = null } = this;
        if (localPreview.srcObject === mediaStream) {
            return;
        }
        if (mediaStream) {
            localPreview.srcObject = mediaStream;
            if (localPreview.width === 0) {
                localPreview.width = this.captureOptions.maxWidth;
            }
            if (localPreview.height === 0) {
                localPreview.height = this.captureOptions.maxHeight;
            }
        }
        else {
            localPreview.srcObject = null;
        }
    }
    captureAndSendOneVideoFrame() {
        if (!this.canvas || !this.canvasContext || !this.sender) {
            return;
        }
        if (this.fakeVideoName != undefined &&
            this.capturingStartTime != undefined) {
            let width = 640;
            let height = 480;
            let duration = Date.now() - this.capturingStartTime;
            this.drawFakeVideo(this.canvasContext, width, height, this.fakeVideoName, duration);
            const image = this.canvasContext.getImageData(0, 0, width, height);
            let bufferWithoutCopying = Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength);
            this.sender.sendVideoFrame(image.width, image.height, bufferWithoutCopying);
            return;
        }
        if (this.localPreview && this.localPreview.current) {
            this.updateLocalPreviewSourceObject();
            const width = this.localPreview.current.videoWidth;
            const height = this.localPreview.current.videoHeight;
            if (width === 0 || height === 0) {
                return;
            }
            this.canvasContext.drawImage(this.localPreview.current, 0, 0, width, height);
            const image = this.canvasContext.getImageData(0, 0, width, height);
            let bufferWithoutCopying = Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength);
            this.sender.sendVideoFrame(image.width, image.height, bufferWithoutCopying);
        }
    }
    drawFakeVideo(context, width, height, name, time) {
        function fill(style, draw) {
            context.fillStyle = style;
            context.beginPath();
            draw();
            context.fill();
        }
        function stroke(style, draw) {
            context.strokeStyle = style;
            context.beginPath();
            draw();
            context.stroke();
        }
        function arc(x, y, radius, start, end) {
            const twoPi = 2 * Math.PI;
            context.arc(x, y, radius, start * twoPi, end * twoPi);
        }
        function circle(x, y, radius) {
            arc(x, y, radius, 0, 1);
        }
        function fillFace(x, y, faceRadius) {
            const eyeRadius = faceRadius / 5;
            const eyeOffsetX = faceRadius / 2;
            const eyeOffsetY = -faceRadius / 4;
            const smileRadius = faceRadius / 2;
            const smileOffsetY = -eyeOffsetY;
            fill('yellow', () => circle(x, y, faceRadius));
            fill('black', () => circle(x - eyeOffsetX, y + eyeOffsetY, eyeRadius));
            fill('black', () => circle(x + eyeOffsetX, y + eyeOffsetY, eyeRadius));
            stroke('black', () => arc(x, y + smileOffsetY, smileRadius, 0, 0.5));
        }
        function fillText(x, y, fillStyle, fontSize, fontName, align, text) {
            context.font = `${fontSize}px ${fontName}`;
            context.textAlign = align;
            context.fillStyle = fillStyle;
            context.fillText(text, x, y);
        }
        function fillLabeledFace(x, y, faceRadius, label) {
            const labelSize = faceRadius * 0.3;
            const labelOffsetY = faceRadius * 1.5;
            fillFace(x, y, faceRadius);
            fillText(x, y + labelOffsetY, 'black', labelSize, 'monospace', 'center', label);
        }
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        fillLabeledFace(width / 2, height / 2, height / 3, `${name} ${time}`);
    }
}
exports.GumVideoCapturer = GumVideoCapturer;
// We add 10% in each dimension to allow for things that are slightly wider or taller than 1080p.
const MAX_VIDEO_CAPTURE_MULTIPLIER = 1.0;
exports.MAX_VIDEO_CAPTURE_WIDTH = 1920 * MAX_VIDEO_CAPTURE_MULTIPLIER;
exports.MAX_VIDEO_CAPTURE_HEIGHT = 1080 * MAX_VIDEO_CAPTURE_MULTIPLIER;
exports.MAX_VIDEO_CAPTURE_AREA = exports.MAX_VIDEO_CAPTURE_WIDTH * exports.MAX_VIDEO_CAPTURE_HEIGHT;
exports.MAX_VIDEO_CAPTURE_BUFFER_SIZE = exports.MAX_VIDEO_CAPTURE_AREA * 4;
class CanvasVideoRenderer {
    constructor() {
        this.buffer = Buffer.alloc(exports.MAX_VIDEO_CAPTURE_BUFFER_SIZE);
    }
    setCanvas(canvas) {
        this.canvas = canvas;
    }
    enable(source) {
        if (this.source === source) {
            return;
        }
        if (!!this.source) {
            // If we're replacing an existing source, make sure we stop the
            // current rAF loop before starting another one.
            if (this.rafId) {
                window.cancelAnimationFrame(this.rafId);
            }
        }
        this.source = source;
        this.requestAnimationFrameCallback();
    }
    disable() {
        this.renderBlack();
        this.source = undefined;
        if (this.rafId) {
            window.cancelAnimationFrame(this.rafId);
        }
    }
    requestAnimationFrameCallback() {
        this.renderVideoFrame();
        this.rafId = window.requestAnimationFrame(this.requestAnimationFrameCallback.bind(this));
    }
    renderBlack() {
        if (!this.canvas) {
            return;
        }
        const canvas = this.canvas.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    renderVideoFrame() {
        var _a, _b;
        if (!this.source || !this.canvas) {
            return;
        }
        const canvas = this.canvas.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        const frame = this.source.receiveVideoFrame(this.buffer);
        if (!frame) {
            return;
        }
        const [width, height] = frame;
        if (canvas.clientWidth <= 0 ||
            width <= 0 ||
            canvas.clientHeight <= 0 ||
            height <= 0) {
            return;
        }
        const frameAspectRatio = width / height;
        const canvasAspectRatio = canvas.clientWidth / canvas.clientHeight;
        let dx = 0;
        let dy = 0;
        if (frameAspectRatio > canvasAspectRatio) {
            // Frame wider than view: We need bars at the top and bottom
            canvas.width = width;
            canvas.height = width / canvasAspectRatio;
            dy = (canvas.height - height) / 2;
        }
        else if (frameAspectRatio < canvasAspectRatio) {
            // Frame narrower than view: We need pillars on the sides
            canvas.width = height * canvasAspectRatio;
            canvas.height = height;
            dx = (canvas.width - width) / 2;
        }
        else {
            // Will stretch perfectly with no bars
            canvas.width = width;
            canvas.height = height;
        }
        if (dx > 0 || dy > 0) {
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (((_a = this.imageData) === null || _a === void 0 ? void 0 : _a.width) !== width || ((_b = this.imageData) === null || _b === void 0 ? void 0 : _b.height) !== height) {
            this.imageData = new ImageData(width, height);
        }
        this.imageData.data.set(this.buffer.subarray(0, width * height * 4));
        context.putImageData(this.imageData, dx, dy);
    }
}
exports.CanvasVideoRenderer = CanvasVideoRenderer;
