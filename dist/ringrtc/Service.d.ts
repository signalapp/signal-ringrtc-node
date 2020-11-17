declare type GroupCallUserId = ArrayBuffer;
export declare class PeekInfo {
    joinedMembers: Array<GroupCallUserId>;
    creator?: GroupCallUserId;
    eraId?: string;
    maxDevices?: number;
    deviceCount: number;
    constructor();
}
export declare class RingRTCType {
    private readonly callManager;
    private _call;
    private _groupCallByClientId;
    private _peekRequests;
    handleOutgoingSignaling: ((remoteUserId: UserId, message: CallingMessage) => Promise<boolean>) | null;
    handleIncomingCall: ((call: Call) => Promise<CallSettings | null>) | null;
    handleAutoEndedIncomingCallRequest: ((remoteUserId: UserId, reason: CallEndedReason) => void) | null;
    handleLogMessage: ((level: CallLogLevel, fileName: string, line: number, message: string) => void) | null;
    handleSendHttpRequest: ((requestId: number, url: string, method: HttpMethod, headers: {
        [name: string]: string;
    }, body: ArrayBuffer | undefined) => void) | null;
    handleSendCallMessage: ((recipientUuid: ArrayBuffer, message: ArrayBuffer) => void) | null;
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
    receivedHttpResponse(requestId: number, status: number, body: ArrayBuffer): void;
    httpRequestFailed(requestId: number, debugInfo: string | undefined): void;
    getGroupCall(groupId: ArrayBuffer, sfuUrl: string, observer: GroupCallObserver): GroupCall | undefined;
    peekGroupCall(sfu_url: string, membership_proof: ArrayBuffer, group_members: Array<GroupMemberInfo>): Promise<PeekInfo>;
    requestMembershipProof(clientId: GroupCallClientId): void;
    requestGroupMembers(clientId: GroupCallClientId): void;
    handleConnectionStateChanged(clientId: GroupCallClientId, connectionState: ConnectionState): void;
    handleJoinStateChanged(clientId: GroupCallClientId, joinState: JoinState): void;
    handleRemoteDevicesChanged(clientId: GroupCallClientId, remoteDeviceStates: Array<RemoteDeviceState>): void;
    handlePeekChanged(clientId: GroupCallClientId, info: PeekInfo): void;
    handlePeekResponse(request_id: number, info: PeekInfo): void;
    handleEnded(clientId: GroupCallClientId, reason: GroupCallEndReason): void;
    onLogMessage(level: number, fileName: string, line: number, message: string): void;
    handleCallingMessage(remoteUserId: UserId, remoteUuid: ArrayBuffer | null, remoteDeviceId: DeviceId, localDeviceId: DeviceId, messageAgeSec: number, message: CallingMessage, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    sendHttpRequest(requestId: number, url: string, method: HttpMethod, headers: {
        [name: string]: string;
    }, body: ArrayBuffer | undefined): void;
    sendCallMessage(recipientUuid: ArrayBuffer, message: ArrayBuffer): void;
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
    private setOutgoingVideoEnabled;
    setLowBandwidthMode(enabled: boolean): void;
    private enableOrDisableRenderer;
}
export declare type GroupCallClientId = number;
export declare enum ConnectionState {
    NotConnected = 0,
    Connecting = 1,
    Connected = 2,
    Reconnecting = 3
}
export declare enum JoinState {
    NotJoined = 0,
    Joining = 1,
    Joined = 2
}
export declare enum BandwidthMode {
    Low = 0,
    Normal = 1
}
export declare enum GroupCallEndReason {
    DeviceExplicitlyDisconnected = 0,
    ServerExplicitlyDisconnected = 1,
    SfuClientFailedToJoin = 2,
    FailedToCreatePeerConnectionFactory = 3,
    FailedToGenerateCertificate = 4,
    FailedToCreateOutgoingAudioTrack = 5,
    FailedToCreatePeerConnection = 6,
    FailedToCreateDataChannel = 7,
    FailedToStartPeerConnection = 8,
    FailedToUpdatePeerConnection = 9,
    FailedToSetMaxSendBitrate = 10,
    IceFailedWhileConnecting = 11,
    IceFailedAfterConnected = 12,
    ServerChangedDemuxId = 13
}
export declare enum HttpMethod {
    Get = 0,
    Put = 1,
    Post = 2,
    Delete = 3
}
export declare class LocalDeviceState {
    connectionState: ConnectionState;
    joinState: JoinState;
    audioMuted: boolean;
    videoMuted: boolean;
    constructor();
}
export declare class RemoteDeviceState {
    demuxId: number;
    userId: ArrayBuffer;
    mediaKeysReceived: boolean;
    audioMuted: boolean | undefined;
    videoMuted: boolean | undefined;
    speakerIndex: number | undefined;
    videoAspectRatio: number | undefined;
    audioLevel: number | undefined;
    constructor(demuxId: number, userId: ArrayBuffer, mediaKeysReceived: boolean);
}
export declare class GroupMemberInfo {
    userId: ArrayBuffer;
    userIdCipherText: ArrayBuffer;
    constructor(userId: ArrayBuffer, userIdCipherText: ArrayBuffer);
}
export declare class VideoRequest {
    demuxId: number;
    width: number;
    height: number;
    framerate: number | undefined;
    constructor(demuxId: number, width: number, height: number, framerate: number | undefined);
}
export interface GroupCallObserver {
    requestMembershipProof(groupCall: GroupCall): void;
    requestGroupMembers(groupCall: GroupCall): void;
    onLocalDeviceStateChanged(groupCall: GroupCall): void;
    onRemoteDeviceStatesChanged(groupCall: GroupCall): void;
    onPeekChanged(groupCall: GroupCall): void;
    onEnded(groupCall: GroupCall, reason: GroupCallEndReason): void;
}
export declare class GroupCall {
    private readonly _callManager;
    private readonly _observer;
    private readonly _clientId;
    get clientId(): GroupCallClientId;
    private _localDeviceState;
    private _remoteDeviceStates;
    private _peekInfo;
    constructor(callManager: CallManager, groupId: ArrayBuffer, sfuUrl: string, observer: GroupCallObserver);
    connect(): void;
    join(): void;
    leave(): void;
    disconnect(): void;
    getLocalDeviceState(): LocalDeviceState;
    getRemoteDeviceStates(): Array<RemoteDeviceState> | undefined;
    getPeekInfo(): PeekInfo | undefined;
    setOutgoingAudioMuted(muted: boolean): void;
    setOutgoingVideoMuted(muted: boolean): void;
    resendMediaKeys(): void;
    setBandwidthMode(bandwidthMode: BandwidthMode): void;
    requestVideo(resolutions: Array<VideoRequest>): void;
    setGroupMembers(members: Array<GroupMemberInfo>): void;
    setMembershipProof(proof: ArrayBuffer): void;
    requestMembershipProof(): void;
    requestGroupMembers(): void;
    handleConnectionStateChanged(connectionState: ConnectionState): void;
    handleJoinStateChanged(joinState: JoinState): void;
    handleRemoteDevicesChanged(remoteDeviceStates: Array<RemoteDeviceState>): void;
    handlePeekChanged(info: PeekInfo): void;
    handleEnded(reason: GroupCallEndReason): void;
    sendVideoFrame(width: number, height: number, rgbaBuffer: ArrayBuffer): void;
    getVideoSource(remoteDemuxId: number): GroupCallVideoFrameSource;
    setRemoteAspectRatio(remoteDemuxId: number, aspectRatio: number): void;
}
declare class GroupCallVideoFrameSource {
    private readonly _callManager;
    private readonly _groupCall;
    private readonly _remoteDemuxId;
    constructor(callManager: CallManager, groupCall: GroupCall, remoteDemuxId: number);
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
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
    opaque?: OpaqueMessage;
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
export declare class OpaqueMessage {
    data?: ProtobufArrayBuffer;
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
    setOutgoingVideoEnabled(enabled: boolean): void;
    setLowBandwidthMode(enabled: boolean): void;
    sendVideoFrame(width: number, height: number, buffer: ArrayBuffer): void;
    receiveVideoFrame(buffer: ArrayBuffer): [number, number] | undefined;
    receivedOffer(remoteUserId: UserId, remoteDeviceId: DeviceId, messageAgeSec: number, callId: CallId, offerType: OfferType, localDeviceId: DeviceId, remoteSupportsMultiRing: boolean, opaque: ArrayBuffer | undefined, sdp: string | undefined, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    receivedAnswer(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, remoteSupportsMultiRing: boolean, opaque: ArrayBuffer | undefined, sdp: string | undefined, senderIdentityKey: ArrayBuffer, receiverIdentityKey: ArrayBuffer): void;
    receivedIceCandidates(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, candidates: Array<IceCandidateMessage>): void;
    receivedHangup(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId, hangupType: HangupType, hangupDeviceId: DeviceId | null): void;
    receivedBusy(remoteUserId: UserId, remoteDeviceId: DeviceId, callId: CallId): void;
    receivedCallMessage(remoteUserId: ArrayBuffer, remoteDeviceId: DeviceId, localDeviceId: DeviceId, data: ArrayBuffer, messageAgeSec: number): void;
    receivedHttpResponse(requestId: number, status: number, body: ArrayBuffer): void;
    httpRequestFailed(requestId: number, debugInfo: string | undefined): void;
    createGroupCallClient(groupId: ArrayBuffer, sfuUrl: string): GroupCallClientId;
    deleteGroupCallClient(clientId: GroupCallClientId): void;
    connect(clientId: GroupCallClientId): void;
    join(clientId: GroupCallClientId): void;
    leave(clientId: GroupCallClientId): void;
    disconnect(clientId: GroupCallClientId): void;
    setOutgoingAudioMuted(clientId: GroupCallClientId, muted: boolean): void;
    setOutgoingVideoMuted(clientId: GroupCallClientId, muted: boolean): void;
    resendMediaKeys(clientId: GroupCallClientId): void;
    setBandwidthMode(clientId: GroupCallClientId, bandwidthMode: BandwidthMode): void;
    requestVideo(clientId: GroupCallClientId, resolutions: Array<VideoRequest>): void;
    setGroupMembers(clientId: GroupCallClientId, members: Array<GroupMemberInfo>): void;
    setMembershipProof(clientId: GroupCallClientId, proof: ArrayBuffer): void;
    receiveGroupCallVideoFrame(clientId: GroupCallClientId, remoteDemuxId: number, buffer: ArrayBuffer): [number, number] | undefined;
    peekGroupCall(requestId: number, sfu_url: string, membership_proof: ArrayBuffer, group_members: Array<GroupMemberInfo>): Promise<PeekInfo>;
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
    sendCallMessage(recipientUuid: ArrayBuffer, message: ArrayBuffer): void;
    sendHttpRequest(requestId: number, url: string, method: HttpMethod, headers: {
        [name: string]: string;
    }, body: ArrayBuffer | undefined): void;
    requestMembershipProof(clientId: GroupCallClientId): void;
    requestGroupMembers(clientId: GroupCallClientId): void;
    handleConnectionStateChanged(clientId: GroupCallClientId, connectionState: ConnectionState): void;
    handleJoinStateChanged(clientId: GroupCallClientId, joinState: JoinState): void;
    handleRemoteDevicesChanged(clientId: GroupCallClientId, remoteDeviceStates: Array<RemoteDeviceState>): void;
    handlePeekChanged(clientId: GroupCallClientId, info: PeekInfo): void;
    handlePeekResponse(request_id: number, info: PeekInfo): void;
    handleEnded(clientId: GroupCallClientId, reason: GroupCallEndReason): void;
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
