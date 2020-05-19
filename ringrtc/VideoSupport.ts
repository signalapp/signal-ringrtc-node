//
// Copyright (C) 2020 Signal Messenger, LLC.
// All rights reserved.
//
// SPDX-License-Identifier: GPL-3.0-only
//

import { Call } from './Service';

// Match a React.RefObject without relying on React.
interface Ref<T> {
  readonly current: T | null;
}

export class GumVideoCapturer {
  private readonly maxWidth: number;
  private readonly maxHeight: number;
  private readonly maxFramerate: number;
  private call?: Call;
  private localPreview: Ref<HTMLVideoElement>;
  private mediaStream?: MediaStream;
  private canvas?: OffscreenCanvas;
  private canvasContext?: OffscreenCanvasRenderingContext2D;
  private intervalId?: any;

  constructor(maxWidth: number, maxHeight: number, maxFramerate: number) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.maxFramerate = maxFramerate;
    this.localPreview = { current: null };
  }

  // Enable without sending
  enableLocalPreview(localPreview: Ref<HTMLVideoElement>): void {
    this.localPreview = localPreview;
    // tslint:disable no-floating-promises
    this.openCamera();
  }

  enable(call: Call, localPreview: Ref<HTMLVideoElement>): void {
    this.enableLocalPreview(localPreview);

    this.call = call;
    this.canvas = new OffscreenCanvas(this.maxWidth, this.maxHeight);
    this.canvasContext = this.canvas.getContext('2d') || undefined;
    const interval = 1000 / this.maxFramerate;
    this.intervalId = setInterval(
      this.captureAndSendOneVideoFrame.bind(this),
      interval
    );
  }

  disable(): void {
    if (!!this.localPreview.current && !!this.localPreview.current.srcObject) {
      const mediaStream = this.localPreview.current.srcObject as MediaStream;
      for (const track of mediaStream.getVideoTracks()) {
        // Make the light turn off faster.
        track.stop();
      }
      this.localPreview.current.srcObject = null;
    }

    this.call = undefined;
    this.localPreview = { current: null };
    this.canvas = undefined;
    this.canvasContext = undefined;
    if (!!this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async openCamera(): Promise<void> {
    try {
      const mediaStream = await window.navigator.mediaDevices.getUserMedia({
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

      // console.log(`Got mediaStream from getUserMedia: ${mediaStream}`);

      if (!!this.localPreview.current && !!mediaStream) {
        this.setLocalPreviewMediaStream(mediaStream);
      }
      this.mediaStream = mediaStream;
    } catch (err) {
      // console.log(`Could not capture video: ${err}`);
    }
  }

  private setLocalPreviewMediaStream(mediaStream: MediaStream): void {
    const localPreview = this.localPreview.current;
    if (!localPreview) {
      return;
    }

    //console.log(`capturer.localPreview.current.srcObject = ${mediaStream}`);

    localPreview.srcObject = mediaStream;
    // I don't know why this is necessary
    if (localPreview.width === 0) {
      localPreview.width = this.maxWidth;
    }
    if (localPreview.height === 0) {
      localPreview.height = this.maxHeight;
    }
  }

  private captureAndSendOneVideoFrame(): void {
    if (!this.localPreview.current) {
      return;
    }
    if (!this.localPreview.current.srcObject && !!this.mediaStream) {
      this.setLocalPreviewMediaStream(this.mediaStream);
    }
    if (!this.canvas || !this.canvasContext || !this.call) {
      return;
    }
    const { width, height } = this.localPreview.current;
    if (width === 0 || height === 0) {
      return;
    }
    this.canvasContext.drawImage(
      this.localPreview.current,
      0,
      0,
      width,
      height
    );
    const image = this.canvasContext.getImageData(0, 0, width, height);
    this.call.sendVideoFrame(image.width, image.height, image.data.buffer);
  }
}

export class CanvasVideoRenderer {
  private call?: Call;
  private canvas: Ref<HTMLCanvasElement>;

  constructor() {
    this.canvas = { current: null };
  }

  enable(call: Call, canvas: Ref<HTMLCanvasElement>): void {
    this.call = call;
    this.canvas = canvas;
    this.call.renderVideoFrame = this.renderVideoFrame.bind(this);
  }

  disable() {
    this.renderBlack();
    this.canvas = { current: null };
    if (!!this.call) {
      this.call.renderVideoFrame = undefined;
    }
    this.call = undefined;
  }

  private renderBlack() {
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

  private renderVideoFrame(width: number, height: number, buffer: ArrayBuffer) {
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

    const frameAspectRatio = width/height;
    const canvasAspectRatio = canvas.clientWidth/canvas.clientHeight;

    let dx = 0;
    let dy = 0;
    if (frameAspectRatio > canvasAspectRatio) {
      // Frame wider than view: We need bars at the top and bottom
      canvas.width = width;
      canvas.height = width / canvasAspectRatio;
      dy = (canvas.height - height) / 2;
    } else if (frameAspectRatio < canvasAspectRatio) {
      // Frame narrower than view: We need pillars on the sides
      canvas.width = height * canvasAspectRatio;
      canvas.height = height;
      dx = (canvas.width - width) / 2;
    } else {
      // Will stretch perfectly with no bars
      canvas.width = width;
      canvas.height = height;
    }

    if (dx > 0 || dy > 0) {
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.putImageData(
      new ImageData(new Uint8ClampedArray(buffer), width, height),
      dx,
      dy,
    );
  }
}
