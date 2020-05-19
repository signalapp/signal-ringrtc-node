import { Call } from './Service';
interface Ref<T> {
    readonly current: T | null;
}
export declare class GumVideoCapturer {
    private readonly maxWidth;
    private readonly maxHeight;
    private readonly maxFramerate;
    private call?;
    private localPreview;
    private mediaStream?;
    private canvas?;
    private canvasContext?;
    private intervalId?;
    constructor(maxWidth: number, maxHeight: number, maxFramerate: number);
    enableLocalPreview(localPreview: Ref<HTMLVideoElement>): void;
    enable(call: Call, localPreview: Ref<HTMLVideoElement>): void;
    disable(): void;
    private openCamera;
    private setLocalPreviewMediaStream;
    private captureAndSendOneVideoFrame;
}
export declare class CanvasVideoRenderer {
    private call?;
    private canvas;
    constructor();
    enable(call: Call, canvas: Ref<HTMLCanvasElement>): void;
    disable(): void;
    private renderBlack;
    private renderVideoFrame;
}
export {};
