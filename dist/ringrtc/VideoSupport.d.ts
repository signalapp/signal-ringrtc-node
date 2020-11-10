interface Ref<T> {
    readonly current: T | null;
}
export interface VideoFrameSource {
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
}
interface VideoFrameSender {
    sendVideoFrame(width: number, height: number, rgbaBuffer: ArrayBuffer): void;
}
export declare class GumVideoCapturer {
    private readonly maxWidth;
    private readonly maxHeight;
    private readonly maxFramerate;
    private localPreview?;
    private capturing;
    private sender?;
    private mediaStream?;
    private canvas?;
    private canvasContext?;
    private intervalId?;
    private preferredDeviceId?;
    private capturingStartTime;
    fakeVideoName: string | undefined;
    constructor(maxWidth: number, maxHeight: number, maxFramerate: number);
    setLocalPreview(localPreview: Ref<HTMLVideoElement> | undefined): void;
    enableCapture(): void;
    enableCaptureAndSend(sender: VideoFrameSender): void;
    disable(): void;
    setPreferredDevice(deviceId: string): Promise<void>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
    private startCapturing;
    private stopCapturing;
    private startSending;
    private stopSending;
    private setLocalPreviewSourceObject;
    private captureAndSendOneVideoFrame;
    private drawFakeVideo;
}
export declare class CanvasVideoRenderer {
    private canvas?;
    private buffer;
    private source?;
    private rafId?;
    constructor();
    setCanvas(canvas: Ref<HTMLCanvasElement> | undefined): void;
    enable(source: VideoFrameSource): void;
    disable(): void;
    private requestAnimationFrameCallback;
    private renderBlack;
    private renderVideoFrame;
}
export {};
