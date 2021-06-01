interface Ref<T> {
    readonly current: T | null;
}
export interface VideoFrameSource {
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
}
interface VideoFrameSender {
    sendVideoFrame(width: number, height: number, rgbaBuffer: ArrayBuffer): void;
}
export declare class GumVideoCaptureOptions {
    maxWidth: number;
    maxHeight: number;
    maxFramerate: number;
    preferredDeviceId?: string;
    screenShareSourceId?: string;
}
export declare class GumVideoCapturer {
    private defaultCaptureOptions;
    private localPreview?;
    private captureOptions?;
    private getUserMediaPromise?;
    private sender?;
    private mediaStream?;
    private canvas?;
    private canvasContext?;
    private intervalId?;
    private preferredDeviceId?;
    private capturingStartTime;
    fakeVideoName: string | undefined;
    constructor(defaultCaptureOptions: GumVideoCaptureOptions);
    capturing(): boolean;
    setLocalPreview(localPreview: Ref<HTMLVideoElement> | undefined): void;
    enableCapture(): void;
    enableCaptureAndSend(sender: VideoFrameSender, options?: GumVideoCaptureOptions): void;
    disable(): void;
    setPreferredDevice(deviceId: string): Promise<void>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
    private getUserMedia;
    private startCapturing;
    private stopCapturing;
    private startSending;
    private stopSending;
    private setLocalPreviewSourceObject;
    private captureAndSendOneVideoFrame;
    private drawFakeVideo;
}
export declare const MAX_VIDEO_CAPTURE_WIDTH: number;
export declare const MAX_VIDEO_CAPTURE_HEIGHT: number;
export declare const MAX_VIDEO_CAPTURE_AREA: number;
export declare const MAX_VIDEO_CAPTURE_BUFFER_SIZE: number;
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
