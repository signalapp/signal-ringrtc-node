import { Call } from './Service';
interface Ref<T> {
    readonly current: T | null;
}
export declare class GumVideoCapturer {
    private readonly maxWidth;
    private readonly maxHeight;
    private readonly maxFramerate;
    private localPreview?;
    private capturing;
    private call?;
    private mediaStream?;
    private canvas?;
    private canvasContext?;
    private intervalId?;
    private preferredDeviceId?;
    constructor(maxWidth: number, maxHeight: number, maxFramerate: number);
    setLocalPreview(localPreview: Ref<HTMLVideoElement> | undefined): void;
    enableCapture(): void;
    enableCaptureAndSend(call: Call): void;
    disable(): void;
    setPreferredDevice(deviceId: string): Promise<void>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
    private startCapturing;
    private stopCapturing;
    private startSending;
    private stopSending;
    private setLocalPreviewSourceObject;
    private captureAndSendOneVideoFrame;
}
export declare class CanvasVideoRenderer {
    private canvas?;
    private buffer;
    private call?;
    private rafId?;
    constructor();
    setCanvas(canvas: Ref<HTMLCanvasElement> | undefined): void;
    enable(call: Call): void;
    disable(): void;
    private requestAnimationFrameCallback;
    private renderBlack;
    private renderVideoFrame;
}
export {};
