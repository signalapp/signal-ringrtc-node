import { Call } from './Service';
interface Ref<T> {
    readonly current: T | null;
}
export declare class GumVideoCapturer {
    private readonly maxWidth;
    private readonly maxHeight;
    private readonly maxFramerate;
    private readonly localPreview;
    private capturing;
    private call?;
    private mediaStream?;
    private canvas?;
    private canvasContext?;
    private intervalId?;
    constructor(maxWidth: number, maxHeight: number, maxFramerate: number, localPreview: Ref<HTMLVideoElement>);
    enableCapture(): void;
    enableCaptureAndSend(call: Call): void;
    disable(): void;
    private startCapturing;
    private stopCapturing;
    private startSending;
    private stopSending;
    private setLocalPreviewSourceObject;
    private captureAndSendOneVideoFrame;
}
export declare class CanvasVideoRenderer {
    private readonly canvas;
    private buffer;
    private call?;
    private rafId?;
    constructor(canvas: Ref<HTMLCanvasElement>);
    enable(call: Call): void;
    disable(): void;
    private requestAnimationFrameCallback;
    private renderBlack;
    private renderVideoFrame;
}
export {};
