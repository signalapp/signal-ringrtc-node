export declare class CallingService {
    callManager: CallManager;
    call?: Call;
    handleIncomingCall: ((call: Call) => Promise<CallSettings>) | null;
    constructor();
    private pollEvery;
    startOutgoingCall(remoteUserId: UserId, isVideoCall: boolean, settings: CallSettings): Call;
    onStartOutgoingCall(remoteUserId: UserId, callId: CallId): void;
    onStartIncomingCall(remoteUserId: UserId, callId: CallId): void;
    private proceed;
    onCallState(remoteUserId: UserId, state: CallState): void;
    onCallEnded(remoteUserId: UserId, reason: string): void;
    onRemoteVideoEnabled(remoteUserId: UserId, enabled: boolean): void;
    renderVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    onSendOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, offerType: OfferType, sdp: string): void;
    onSendAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, sdp: string): void;
    onSendIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, candidates: IceCandidateMessage[]): void;
    onSendLegacyHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, hangupType: HangupType, deviceId: DeviceId | null): void;
    onSendHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, hangupType: HangupType, deviceId: DeviceId | null): void;
    onSendBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean): void;
    onLog(message: string): void;
    private sendSignaling;
    handleMessage(remoteUserId: UserId, remoteDeviceId: DeviceId, message: CallingMessage): void;
}
declare const Service: CallingService;
export default Service;
interface CallSettings {
    localDeviceId: DeviceId;
    iceServer: IceServer;
    hideIp: boolean;
}
interface IceServer {
    username?: string;
    password?: string;
    urls: string[];
}
export declare class Call {
    private _callManager;
    private _remoteUserId;
    callId: CallId | null;
    private _incoming;
    settings: CallSettings | null;
    private _state;
    private _outgoingVideoEnabled;
    endedReason?: string;
    sendSignaling?: (message: CallingMessage) => void;
    handleStateChanged?: () => void;
    handleRemoteVideoEnabled?: (enabled: boolean) => void;
    renderVideoFrame?: (width: number, height: number, buffer: ArrayBuffer) => void;
    constructor(callManager: CallManager, remoteUserId: UserId, callId: CallId, incoming: boolean, settings: CallSettings | null, state: CallState);
    get remoteUserId(): UserId;
    get incoming(): boolean;
    get state(): CallState;
    set state(state: CallState);
    accept(): void;
    hangup(): void;
    set outgoingAudioEnabled(enabled: boolean);
    get outgoingVideoEnabled(): boolean;
    set outgoingVideoEnabled(enabled: boolean);
    sendVideoFrame(width: number, height: number, rgbaBuffer: ArrayBuffer): void;
}
export declare type UserId = string;
export declare type DeviceId = number;
export declare type CallId = any;
export declare class CallingMessage {
    offer?: OfferMessage;
    answer?: AnswerMessage;
    iceCandidates?: IceCandidateMessage[];
    legacyHangup?: HangupMessage;
    busy?: BusyMessage;
    hangup?: HangupMessage;
    supportsMultiRing?: boolean;
    destinationDeviceId?: DeviceId;
}
export declare class OfferMessage {
    callId?: CallId;
    type?: OfferType;
    sdp?: string;
}
export declare enum OfferType {
    AudioCall = 0,
    VideoCall = 1,
    NeedsPermission = 2
}
export declare class AnswerMessage {
    callId?: CallId;
    sdp?: string;
}
export declare class IceCandidateMessage {
    callId?: CallId;
    mid?: string;
    midIndex?: number;
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
    Busy = 3
}
export interface CallManager {
    call(remoteUserId: UserId, isVideoCall: boolean): void;
    proceed(callId: CallId, localDeviceId: DeviceId, iceServerUsername: string, iceServerPassword: string, iceServerUrls: string[], hideIp: boolean, enableForking: boolean): void;
    accept(callId: CallId): void;
    hangup(): void;
    setOutgoingAudioEnabled(enabled: boolean): void;
    sendVideoStatus(enabled: boolean): void;
    sendVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    receivedOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, offerType: OfferType, remoteSupportsMultiRing: boolean, sdp: string): void;
    receivedAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, remoteSupportsMultiRing: boolean, sdp: string): void;
    receivedIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, candiateSdps: string[]): void;
    receivedHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, hangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    receivedBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId): void;
    poll(callbacks: CallManagerCallbacks): void;
}
export interface CallManagerCallbacks {
    onStartOutgoingCall(remoteUserId: UserId, callId: CallId): void;
    onStartIncomingCall(remoteUserId: UserId, callId: CallId): void;
    onCallState(remoteUserId: UserId, state: CallState): void;
    onCallEnded(remoteUserId: UserId, endReason: string): void;
    onRemoteVideoEnabled(remoteUserId: UserId, enabled: boolean): void;
    renderVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    onSendOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, mediaType: number, sdp: string): void;
    onSendAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, sdp: string): void;
    onSendIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, candidates: IceCandidateMessage[]): void;
    onSendLegacyHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, HangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    onSendHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean, HangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    onSendBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, broadcast: boolean): void;
    onLog(message: string): void;
}
export declare enum CallState {
    Init = "init",
    Ringing = "ringing",
    Connected = "connected",
    Connecting = "connecting",
    Ended = "concluded"
}
