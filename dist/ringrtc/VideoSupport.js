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
    constructor(maxWidth, maxHeight, maxFramerate, localPreview) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.maxFramerate = maxFramerate;
        this.localPreview = localPreview;
        this.capturing = false;
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
                if (!!this.localPreview.current && !!mediaStream) {
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
        if (!!this.localPreview.current) {
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
        if (!this.localPreview.current) {
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
    constructor(canvas) {
        this.canvas = canvas;
    }
    enable(call) {
        if (this.call === call) {
            return;
        }
        this.call = call;
        this.call.renderVideoFrame = this.renderVideoFrame.bind(this);
    }
    disable() {
        this.renderBlack();
        if (!!this.call) {
            this.call.renderVideoFrame = undefined;
        }
        this.call = undefined;
    }
    renderBlack() {
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
    renderVideoFrame(width, height, buffer) {
        const canvas = this.canvas.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
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
        context.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), dx, dy);
    }
}
exports.CanvasVideoRenderer = CanvasVideoRenderer;
