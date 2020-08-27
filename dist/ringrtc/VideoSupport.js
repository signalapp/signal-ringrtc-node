"use strict";
//
// Copyright (C) 2020 Signal Messenger, LLC.
// All rights reserved.
//
// SPDX-License-Identifier: GPL-3.0-only
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
class GumVideoCapturer {
    constructor(maxWidth, maxHeight, maxFramerate) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.maxFramerate = maxFramerate;
        this.capturing = false;
    }
    setLocalPreview(localPreview) {
        this.localPreview = localPreview;
    }
    enableCapture() {
        // tslint:disable no-floating-promises
        this.startCapturing();
    }
    enableCaptureAndSend(call) {
        // tslint:disable no-floating-promises
        this.startCapturing();
        this.startSending(call);
    }
    disable() {
        this.stopCapturing();
        this.stopSending();
    }
    setPreferredDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.preferredDeviceId = deviceId;
            if (this.capturing) {
                // Restart capturing to start using the new device
                yield this.stopCapturing();
                yield this.startCapturing();
            }
        });
    }
    enumerateDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield window.navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind == "videoinput");
            return cameras;
        });
    }
    startCapturing() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.capturing) {
                return;
            }
            this.capturing = true;
            try {
                const mediaStream = yield window.navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        deviceId: this.preferredDeviceId,
                        width: {
                            max: this.maxWidth,
                        },
                        height: {
                            max: this.maxHeight,
                        },
                        frameRate: {
                            max: this.maxFramerate,
                        },
                    },
                });
                // We could have been disabled between when we requested the stream
                // and when we got it.
                if (!this.capturing) {
                    for (const track of mediaStream.getVideoTracks()) {
                        // Make the light turn off faster
                        track.stop();
                    }
                    return;
                }
                if (this.localPreview && !!this.localPreview.current && !!mediaStream) {
                    this.setLocalPreviewSourceObject(mediaStream);
                }
                this.mediaStream = mediaStream;
            }
            catch (_a) {
                // We couldn't open the camera.  Oh well.
            }
        });
    }
    stopCapturing() {
        if (!this.capturing) {
            return;
        }
        this.capturing = false;
        if (!!this.mediaStream) {
            for (const track of this.mediaStream.getVideoTracks()) {
                // Make the light turn off faster
                track.stop();
            }
            this.mediaStream = undefined;
        }
        if (this.localPreview && !!this.localPreview.current) {
            this.localPreview.current.srcObject = null;
        }
    }
    startSending(call) {
        if (this.call === call) {
            return;
        }
        this.call = call;
        this.canvas = new OffscreenCanvas(this.maxWidth, this.maxHeight);
        this.canvasContext = this.canvas.getContext('2d') || undefined;
        const interval = 1000 / this.maxFramerate;
        this.intervalId = setInterval(this.captureAndSendOneVideoFrame.bind(this), interval);
    }
    stopSending() {
        this.call = undefined;
        this.canvas = undefined;
        this.canvasContext = undefined;
        if (!!this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    setLocalPreviewSourceObject(mediaStream) {
        if (!this.localPreview) {
            return;
        }
        const localPreview = this.localPreview.current;
        if (!localPreview) {
            return;
        }
        localPreview.srcObject = mediaStream;
        // I don't know why this is necessary
        if (localPreview.width === 0) {
            localPreview.width = this.maxWidth;
        }
        if (localPreview.height === 0) {
            localPreview.height = this.maxHeight;
        }
    }
    captureAndSendOneVideoFrame() {
        if (!this.localPreview || !this.localPreview.current) {
            return;
        }
        if (!this.localPreview.current.srcObject && !!this.mediaStream) {
            this.setLocalPreviewSourceObject(this.mediaStream);
        }
        if (!this.canvas || !this.canvasContext || !this.call) {
            return;
        }
        const { width, height } = this.localPreview.current;
        if (width === 0 || height === 0) {
            return;
        }
        this.canvasContext.drawImage(this.localPreview.current, 0, 0, width, height);
        const image = this.canvasContext.getImageData(0, 0, width, height);
        this.call.sendVideoFrame(image.width, image.height, image.data.buffer);
    }
}
exports.GumVideoCapturer = GumVideoCapturer;
class CanvasVideoRenderer {
    constructor() {
        // The max size video frame we'll support (in RGBA)
        this.buffer = new ArrayBuffer(1920 * 1080 * 4);
    }
    setCanvas(canvas) {
        this.canvas = canvas;
    }
    enable(call) {
        if (this.call === call) {
            return;
        }
        this.call = call;
        this.requestAnimationFrameCallback();
    }
    disable() {
        this.renderBlack();
        this.call = undefined;
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
        if (!this.call || !this.canvas) {
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
        const frame = this.call.receiveVideoFrame(this.buffer);
        if (!frame) {
            return;
        }
        const [width, height] = frame;
        if (canvas.clientWidth <= 0 || width <= 0 ||
            canvas.clientHeight <= 0 || height <= 0) {
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
        context.putImageData(new ImageData(new Uint8ClampedArray(this.buffer, 0, width * height * 4), width, height), dx, dy);
    }
}
exports.CanvasVideoRenderer = CanvasVideoRenderer;
