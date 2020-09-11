export declare class RingRTCType {
    private readonly callManager;
    private _call;
    handleOutgoingSignaling: ((remoteUserId: UserId, message: CallingMessage) => Promise<boolean>) | null;
    handleIncomingCall: ((call: Call) => Promise<CallSettings | null>) | null;
    handleAutoEndedIncomingCallRequest: ((remoteUserId: UserId, reason: CallEndedReason) => void) | null;
    handleLogMessage: ((level: CallLogLevel, fileName: string, line: number, message: string) => void) | null;
    constructor();
    private pollEvery;
    startOutgoingCall(remoteUserId: UserId, isVideoCall: boolean, localDeviceId: DeviceId, settings: CallSettings): Call;
    onStartOutgoingCall(remoteUserId: UserId, callId: CallId): void;
    onStartIncomingCall(remoteUserId: UserId, callId: CallId, isVideoCall: boolean): void;
    private proceed;
    onCallState(remoteUserId: UserId, state: CallState): void;
    onCallEnded(remoteUserId: UserId, reason: CallEndedReason): void;
    onRemoteVideoEnabled(remoteUserId: UserId, enabled: boolean): void;
    renderVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    onSendOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, offerType: OfferType, opaque?: ArrayBuffer, sdp?: string): void;
    onSendAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, opaque?: ArrayBuffer, sdp?: string): void;
    onSendIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, candidates: Array<IceCandidateMessage>): void;
    onSendLegacyHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, hangupType: HangupType, deviceId: DeviceId | null): void;
    onSendHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, hangupType: HangupType, deviceId: DeviceId | null): void;
    onSendBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean): void;
    private sendSignaling;
    onLogMessage(level: number, fileName: string, line: number, message: string): void;
    handleCallingMessage(remoteUserId: UserId, remoteDeviceId: DeviceId, localDeviceId: DeviceId, messageAgeSec: number, message: CallingMessage, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    get call(): Call | null;
    getCall(callId: CallId): Call | null;
    accept(callId: CallId, asVideoCall: boolean): void;
    decline(callId: CallId): void;
    ignore(callId: CallId): void;
    hangup(callId: CallId): void;
    setOutgoingAudio(callId: CallId, enabled: boolean): void;
    setOutgoingVideo(callId: CallId, enabled: boolean): void;
    setVideoCapturer(callId: CallId, capturer: VideoCapturer | null): void;
    setVideoRenderer(callId: CallId, renderer: VideoRenderer | null): void;
    getAudioInputs(): AudioDevice[];
    setAudioInput(index: number): void;
    getAudioOutputs(): AudioDevice[];
    setAudioOutput(index: number): void;
}
export interface CallSettings {
    iceServer: IceServer;
    hideIp: boolean;
}
interface IceServer {
    username?: string;
    password?: string;
    urls: Array<string>;
}
export interface AudioDevice {
    name: string;
    index: number;
    uniqueId: string;
    i18nKey?: string;
}
export interface VideoCapturer {
    enableCapture(): void;
    enableCaptureAndSend(call: Call): void;
    disable(): void;
}
export interface VideoRenderer {
    enable(call: Call): void;
    disable(): void;
}
export declare class Call {
    private readonly _callManager;
    private readonly _remoteUserId;
    callId: CallId;
    private readonly _isIncoming;
    private readonly _isVideoCall;
    settings: CallSettings | null;
    private _state;
    private _outgoingAudioEnabled;
    private _outgoingVideoEnabled;
    private _remoteVideoEnabled;
    private _videoCapturer;
    private _videoRenderer;
    endedReason?: CallEndedReason;
    handleStateChanged?: () => void;
    handleRemoteVideoEnabled?: () => void;
    renderVideoFrame?: (width: number, height: number, buffer: ArrayBuffer) => void;
    constructor(callManager: CallManager, remoteUserId: UserId, callId: CallId, isIncoming: boolean, isVideoCall: boolean, settings: CallSettings | null, state: CallState);
    get remoteUserId(): UserId;
    get isIncoming(): boolean;
    get isVideoCall(): boolean;
    get state(): CallState;
    set state(state: CallState);
    set videoCapturer(capturer: VideoCapturer | null);
    set videoRenderer(renderer: VideoRenderer | null);
    accept(): void;
    decline(): void;
    ignore(): void;
    hangup(): void;
    get outgoingAudioEnabled(): boolean;
    set outgoingAudioEnabled(enabled: boolean);
    get outgoingVideoEnabled(): boolean;
    set outgoingVideoEnabled(enabled: boolean);
    get remoteVideoEnabled(): boolean;
    set remoteVideoEnabled(enabled: boolean);
    sendVideoFrame(width: number, height: number, rgbaBuffer: ArrayBuffer): void;
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
    private enableOrDisableCapturer;
    private sendVideoStatus;
    setLowBandwidthMode(enabled: boolean): void;
    private enableOrDisableRenderer;
}
declare type ProtobufArrayBuffer = ArrayBuffer | {
    toArrayBuffer: () => ArrayBuffer;
};
export declare type UserId = string;
export declare type DeviceId = number;
export declare type CallId = any;
export declare class CallingMessage {
    offer?: OfferMessage;
    answer?: AnswerMessage;
    iceCandidates?: Array<IceCandidateMessage>;
    legacyHangup?: HangupMessage;
    busy?: BusyMessage;
    hangup?: HangupMessage;
    supportsMultiRing?: boolean;
    destinationDeviceId?: DeviceId;
}
export declare class OfferMessage {
    callId?: CallId;
    type?: OfferType;
    opaque?: ProtobufArrayBuffer;
    sdp?: string;
}
export declare enum OfferType {
    AudioCall = 0,
    VideoCall = 1
}
export declare class AnswerMessage {
    callId?: CallId;
    opaque?: ProtobufArrayBuffer;
    sdp?: string;
}
export declare class IceCandidateMessage {
    callId?: CallId;
    mid?: string;
    line?: number;
    opaque?: ProtobufArrayBuffer;
    sdp?: string;
}
export declare class BusyMessage {
    callId?: CallId;
}
export declare class HangupMessage {
    callId?: CallId;
    type?: HangupType;
    deviceId?: DeviceId;
}
export declare enum HangupType {
    Normal = 0,
    Accepted = 1,
    Declined = 2,
    Busy = 3,
    NeedPermission = 4
}
export interface CallManager {
    createOutgoingCall(remoteUserId: UserId, isVideoCall: boolean, localDeviceId: DeviceId): CallId;
    proceed(callId: CallId, iceServerUsername: string, iceServerPassword: string, iceServerUrls: Array<string>, hideIp: boolean): void;
    accept(callId: CallId): void;
    ignore(callId: CallId): void;
    hangup(): void;
    signalingMessageSent(callId: CallId): void;
    signalingMessageSendFailed(callId: CallId): void;
    setOutgoingAudioEnabled(enabled: boolean): void;
    sendVideoStatus(enabled: boolean): void;
    setLowBandwidthMode(enabled: boolean): void;
    sendVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
    receivedOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, messageAgeSec: number, callId: CallId, offerType: OfferType, localDeviceId: DeviceId, remoteSupportsMultiRing: boolean, opaque: ArrayBuffer | undefined, sdp: string | undefined, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    receivedAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, remoteSupportsMultiRing: boolean, opaque: ArrayBuffer | undefined, sdp: string | undefined, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    receivedIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, candidates: Array<IceCandidateMessage>): void;
    receivedHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, hangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    receivedBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId): void;
    getAudioInputs(): AudioDevice[];
    setAudioInput(index: number): void;
    getAudioOutputs(): AudioDevice[];
    setAudioOutput(index: number): void;
    poll(callbacks: CallManagerCallbacks): void;
}
export interface CallManagerCallbacks {
    onStartOutgoingCall(remoteUserId: UserId, callId: CallId): void;
    onStartIncomingCall(remoteUserId: UserId, callId: CallId, isVideoCall: boolean): void;
    onCallState(remoteUserId: UserId, state: CallState): void;
    onCallEnded(remoteUserId: UserId, endedReason: CallEndedReason): void;
    onRemoteVideoEnabled(remoteUserId: UserId, enabled: boolean): void;
    onSendOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, mediaType: number, opaque?: ArrayBuffer, sdp?: string): void;
    onSendAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, opaque?: ArrayBuffer, sdp?: string): void;
    onSendIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, candidates: Array<IceCandidateMessage>): void;
    onSendLegacyHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, HangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    onSendHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, HangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    onSendBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean): void;
    onLogMessage(level: number, fileName: string, line: number, message: string): void;
}
export declare enum CallState {
    Prering = "init",
    Ringing = "ringing",
    Accepted = "connected",
    Reconnecting = "connecting",
    Ended = "ended"
}
export declare enum CallEndedReason {
    LocalHangup = "LocalHangup",
    RemoteHangup = "RemoteHangup",
    RemoteHangupNeedPermission = "RemoteHangupNeedPermission",
    Declined = "Declined",
    Busy = "Busy",
    Glare = "Glare",
    ReceivedOfferExpired = "ReceivedOfferExpired",
    ReceivedOfferWhileActive = "ReceivedOfferWhileActive",
    ReceivedOfferWithGlare = "ReceivedOfferWithGlare",
    SignalingFailure = "SignalingFailure",
    ConnectionFailure = "ConnectionFailure",
    InternalFailure = "InternalFailure",
    Timeout = "Timeout",
    AcceptedOnAnotherDevice = "AcceptedOnAnotherDevice",
    DeclinedOnAnotherDevice = "DeclinedOnAnotherDevice",
    BusyOnAnotherDevice = "BusyOnAnotherDevice",
    CallerIsNotMultiring = "CallerIsNotMultiring"
}
export declare enum CallLogLevel {
    Off = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4,
    Trace = 5
}
export {};
