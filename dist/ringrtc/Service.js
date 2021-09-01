"use strict";
//
// Copyright 2019-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
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
exports.CallLogLevel = exports.CallEndedReason = exports.CallState = exports.RingCancelReason = exports.BandwidthMode = exports.HangupType = exports.OpaqueMessage = exports.HangupMessage = exports.BusyMessage = exports.IceCandidateMessage = exports.AnswerMessage = exports.OfferType = exports.OfferMessage = exports.CallingMessage = exports.GroupCall = exports.VideoRequest = exports.GroupMemberInfo = exports.RemoteDeviceState = exports.LocalDeviceState = exports.HttpMethod = exports.RingUpdate = exports.CallMessageUrgency = exports.GroupCallEndReason = exports.JoinState = exports.ConnectionState = exports.Call = exports.RingRTCType = exports.NetworkRoute = exports.PeekInfo = void 0;
/* tslint:disable max-classes-per-file */
const os = require("os");
const process = require("process");
// tslint:disable-next-line no-var-requires no-require-imports
const Native = require('../../build/' +
    os.platform() +
    '/libringrtc-' +
    process.arch +
    '.node');
// tslint:disable-next-line no-unnecessary-class
class NativeCallManager {
    constructor() {
        const callEndpoint = Native.createCallEndpoint();
        Object.defineProperty(this, Native.callEndpointPropertyKey, {
            value: callEndpoint,
        });
    }
}
// Mirror methods onto NativeCallManager.
// This is done through direct assignment rather than wrapper methods to avoid indirection.
NativeCallManager.prototype.setSelfUuid = Native.cm_setSelfUuid;
NativeCallManager.prototype.createOutgoingCall =
    Native.cm_createOutgoingCall;
NativeCallManager.prototype.proceed = Native.cm_proceed;
NativeCallManager.prototype.accept = Native.cm_accept;
NativeCallManager.prototype.ignore = Native.cm_ignore;
NativeCallManager.prototype.hangup = Native.cm_hangup;
NativeCallManager.prototype.cancelGroupRing =
    Native.cm_cancelGroupRing;
NativeCallManager.prototype.signalingMessageSent =
    Native.cm_signalingMessageSent;
NativeCallManager.prototype.signalingMessageSendFailed =
    Native.cm_signalingMessageSendFailed;
NativeCallManager.prototype.updateBandwidthMode =
    Native.cm_updateBandwidthMode;
NativeCallManager.prototype.receivedOffer = Native.cm_receivedOffer;
NativeCallManager.prototype.receivedAnswer = Native.cm_receivedAnswer;
NativeCallManager.prototype.receivedIceCandidates =
    Native.cm_receivedIceCandidates;
NativeCallManager.prototype.receivedHangup = Native.cm_receivedHangup;
NativeCallManager.prototype.receivedBusy = Native.cm_receivedBusy;
NativeCallManager.prototype.receivedCallMessage =
    Native.cm_receivedCallMessage;
NativeCallManager.prototype.receivedHttpResponse =
    Native.cm_receivedHttpResponse;
NativeCallManager.prototype.httpRequestFailed =
    Native.cm_httpRequestFailed;
NativeCallManager.prototype.setOutgoingAudioEnabled =
    Native.cm_setOutgoingAudioEnabled;
NativeCallManager.prototype.setOutgoingVideoEnabled =
    Native.cm_setOutgoingVideoEnabled;
NativeCallManager.prototype.setOutgoingVideoIsScreenShare =
    Native.cm_setOutgoingVideoIsScreenShare;
NativeCallManager.prototype.sendVideoFrame = Native.cm_sendVideoFrame;
NativeCallManager.prototype.receiveVideoFrame =
    Native.cm_receiveVideoFrame;
NativeCallManager.prototype.receiveGroupCallVideoFrame =
    Native.cm_receiveGroupCallVideoFrame;
NativeCallManager.prototype.createGroupCallClient =
    Native.cm_createGroupCallClient;
NativeCallManager.prototype.deleteGroupCallClient =
    Native.cm_deleteGroupCallClient;
NativeCallManager.prototype.connect = Native.cm_connect;
NativeCallManager.prototype.join = Native.cm_join;
NativeCallManager.prototype.leave = Native.cm_leave;
NativeCallManager.prototype.disconnect = Native.cm_disconnect;
NativeCallManager.prototype.groupRing = Native.cm_groupRing;
NativeCallManager.prototype.setOutgoingAudioMuted =
    Native.cm_setOutgoingAudioMuted;
NativeCallManager.prototype.setOutgoingVideoMuted =
    Native.cm_setOutgoingVideoMuted;
NativeCallManager.prototype.setOutgoingGroupCallVideoIsScreenShare =
    Native.cm_setOutgoingGroupCallVideoIsScreenShare;
NativeCallManager.prototype.setPresenting = Native.cm_setPresenting;
NativeCallManager.prototype.resendMediaKeys =
    Native.cm_resendMediaKeys;
NativeCallManager.prototype.setBandwidthMode =
    Native.cm_setBandwidthMode;
NativeCallManager.prototype.requestVideo = Native.cm_requestVideo;
NativeCallManager.prototype.setGroupMembers =
    Native.cm_setGroupMembers;
NativeCallManager.prototype.setMembershipProof =
    Native.cm_setMembershipProof;
NativeCallManager.prototype.peekGroupCall = Native.cm_peekGroupCall;
NativeCallManager.prototype.getAudioInputs = Native.cm_getAudioInputs;
NativeCallManager.prototype.setAudioInput = Native.cm_setAudioInput;
NativeCallManager.prototype.getAudioOutputs =
    Native.cm_getAudioOutputs;
NativeCallManager.prototype.setAudioOutput = Native.cm_setAudioOutput;
NativeCallManager.prototype.poll = Native.cm_poll;
class PeekInfo {
    constructor() {
        this.joinedMembers = [];
        this.deviceCount = 0;
    }
}
exports.PeekInfo = PeekInfo;
// In sync with WebRTC's PeerConnection.AdapterType.
// Despite how it looks, this is not an option set.
// A network adapter type can only be one of the listed values.
// And there are a few oddities to note:
// - Cellular means we don't know if it's 2G, 3G, 4G, 5G, ...
//   If we know, it will be one of those corresponding enum values.
//   This means to know if something is cellular or not, you must
//   check all of those values.
// - Default means we don't know the adapter type (like Unknown)
//   but it's because we bound to the default IP address (0.0.0.0)
//   so it's probably the default adapter (wifi if available, for example)
//   This is unlikely to happen in practice.
var NetworkAdapterType;
(function (NetworkAdapterType) {
    NetworkAdapterType[NetworkAdapterType["Unknown"] = 0] = "Unknown";
    NetworkAdapterType[NetworkAdapterType["Ethernet"] = 1] = "Ethernet";
    NetworkAdapterType[NetworkAdapterType["Wifi"] = 2] = "Wifi";
    NetworkAdapterType[NetworkAdapterType["Cellular"] = 4] = "Cellular";
    NetworkAdapterType[NetworkAdapterType["Vpn"] = 8] = "Vpn";
    NetworkAdapterType[NetworkAdapterType["Loopback"] = 16] = "Loopback";
    NetworkAdapterType[NetworkAdapterType["Default"] = 32] = "Default";
    NetworkAdapterType[NetworkAdapterType["Cellular2G"] = 64] = "Cellular2G";
    NetworkAdapterType[NetworkAdapterType["Cellular3G"] = 128] = "Cellular3G";
    NetworkAdapterType[NetworkAdapterType["Cellular4G"] = 256] = "Cellular4G";
    NetworkAdapterType[NetworkAdapterType["Cellular5G"] = 512] = "Cellular5G";
})(NetworkAdapterType || (NetworkAdapterType = {}));
// Information about the network route being used for sending audio/video/data
class NetworkRoute {
    constructor() {
        this.localAdapterType = NetworkAdapterType.Unknown;
    }
}
exports.NetworkRoute = NetworkRoute;
class Requests {
    constructor() {
        this._resolveById = new Map();
        this._nextId = 1;
    }
    add() {
        const id = this._nextId++;
        const promise = new Promise((resolve, _reject) => {
            this._resolveById.set(id, resolve);
        });
        return [id, promise];
    }
    resolve(id, response) {
        const resolve = this._resolveById.get(id);
        if (!resolve) {
            return false;
        }
        resolve(response);
        this._resolveById.delete(id);
        return true;
    }
}
class RingRTCType {
    constructor() {
        // Set by UX
        this.handleOutgoingSignaling = null;
        this.handleIncomingCall = null;
        this.handleAutoEndedIncomingCallRequest = null;
        this.handleLogMessage = null;
        this.handleSendHttpRequest = null;
        this.handleSendCallMessage = null;
        this.handleSendCallMessageToGroup = null;
        this.handleGroupCallRingUpdate = null;
        this.callManager = new NativeCallManager();
        this._call = null;
        this._groupCallByClientId = new Map();
        this._peekRequests = new Requests();
        this.pollEvery(50);
    }
    pollEvery(intervalMs) {
        this.callManager.poll(this);
        setTimeout(() => {
            this.pollEvery(intervalMs);
        }, intervalMs);
    }
    // Called by UX
    setSelfUuid(uuid) {
        this.callManager.setSelfUuid(uuid);
    }
    // Called by UX
    startOutgoingCall(remoteUserId, isVideoCall, localDeviceId, settings) {
        const callId = this.callManager.createOutgoingCall(remoteUserId, isVideoCall, localDeviceId);
        const isIncoming = false;
        const call = new Call(this.callManager, remoteUserId, callId, isIncoming, isVideoCall, settings, CallState.Prering);
        this._call = call;
        // We won't actually send anything until the remote side accepts.
        call.outgoingAudioEnabled = true;
        call.outgoingVideoEnabled = isVideoCall;
        return call;
    }
    // Called by UX
    cancelGroupRing(groupId, ringId, reason) {
        silly_deadlock_protection(() => {
            this.callManager.cancelGroupRing(groupId, ringId.toString(), reason);
        });
    }
    // Called by Rust
    onStartOutgoingCall(remoteUserId, callId) {
        const call = this._call;
        if (!call || call.remoteUserId !== remoteUserId || !call.settings) {
            return;
        }
        call.callId = callId;
        this.proceed(callId, call.settings);
    }
    // Called by Rust
    onStartIncomingCall(remoteUserId, callId, isVideoCall) {
        // Temporary: Force hangup in all glare scenarios until handled gracefully.
        // In case of a glare loser, an incoming call will be generated right
        // after the outgoing call is ended. In that case, ignore it once.
        if (this._call && this._call.endedReason === CallEndedReason.Glare) {
            this._call.endedReason = undefined;
            this.ignore(callId);
            return;
        }
        const isIncoming = true;
        const call = new Call(this.callManager, remoteUserId, callId, isIncoming, isVideoCall, null, CallState.Prering);
        // Callback to UX not set
        const handleIncomingCall = this.handleIncomingCall;
        if (!handleIncomingCall) {
            call.ignore();
            return;
        }
        this._call = call;
        // tslint:disable no-floating-promises
        (() => __awaiter(this, void 0, void 0, function* () {
            const settings = yield handleIncomingCall(call);
            if (!settings) {
                call.ignore();
                return;
            }
            call.settings = settings;
            this.proceed(callId, settings);
        }))();
    }
    proceed(callId, settings) {
        silly_deadlock_protection(() => {
            this.callManager.proceed(callId, settings.iceServer.username || '', settings.iceServer.password || '', settings.iceServer.urls, settings.hideIp, settings.bandwidthMode);
        });
    }
    // Called by Rust
    onCallState(remoteUserId, state) {
        const call = this._call;
        if (!call || call.remoteUserId !== remoteUserId) {
            return;
        }
        call.state = state;
    }
    // Called by Rust
    onCallEnded(remoteUserId, reason) {
        const call = this._call;
        // Temporary: Force hangup in all glare scenarios until handled gracefully.
        if (call &&
            (reason === CallEndedReason.ReceivedOfferWithGlare ||
                reason === CallEndedReason.Glare)) {
            call.hangup();
        }
        // If there is no call or the remoteUserId doesn't match that of
        // the current call, or if one of the "receive offer while alread
        // in a call" reasons are provided, don't end the current call,
        // just update the call history.
        if (!call ||
            call.remoteUserId !== remoteUserId ||
            reason === CallEndedReason.ReceivedOfferWhileActive ||
            reason === CallEndedReason.ReceivedOfferExpired) {
            if (this.handleAutoEndedIncomingCallRequest) {
                this.handleAutoEndedIncomingCallRequest(remoteUserId, reason);
            }
            return;
        }
        // Send the end reason first because setting the state triggers
        // call.handleStateChanged, which may look at call.endedReason.
        call.endedReason = reason;
        call.state = CallState.Ended;
    }
    onRemoteVideoEnabled(remoteUserId, enabled) {
        const call = this._call;
        if (!call || call.remoteUserId !== remoteUserId) {
            return;
        }
        call.remoteVideoEnabled = enabled;
        if (call.handleRemoteVideoEnabled) {
            call.handleRemoteVideoEnabled();
        }
    }
    onRemoteSharingScreen(remoteUserId, enabled) {
        const call = this._call;
        if (!call || call.remoteUserId !== remoteUserId) {
            return;
        }
        call.remoteSharingScreen = enabled;
        if (call.handleRemoteSharingScreen) {
            call.handleRemoteSharingScreen();
        }
    }
    onNetworkRouteChanged(remoteUserId, localNetworkAdapterType) {
        const call = this._call;
        if (!call || call.remoteUserId !== remoteUserId) {
            return;
        }
        call.networkRoute.localAdapterType = localNetworkAdapterType;
        if (call.handleNetworkRouteChanged) {
            call.handleNetworkRouteChanged();
        }
    }
    renderVideoFrame(width, height, buffer) {
        var _a, _b;
        const call = this._call;
        if (!call) {
            return;
        }
        if (!!((_a = this._call) === null || _a === void 0 ? void 0 : _a.renderVideoFrame)) {
            (_b = this._call) === null || _b === void 0 ? void 0 : _b.renderVideoFrame(width, height, buffer);
        }
    }
    // Called by Rust
    onSendOffer(remoteUserId, remoteDeviceId, callId, broadcast, offerType, opaque) {
        const message = new CallingMessage();
        message.offer = new OfferMessage();
        message.offer.callId = callId;
        message.offer.type = offerType;
        message.offer.opaque = opaque;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendAnswer(remoteUserId, remoteDeviceId, callId, broadcast, opaque) {
        const message = new CallingMessage();
        message.answer = new AnswerMessage();
        message.answer.callId = callId;
        message.answer.opaque = opaque;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendIceCandidates(remoteUserId, remoteDeviceId, callId, broadcast, candidates) {
        const message = new CallingMessage();
        message.iceCandidates = [];
        for (const candidate of candidates) {
            const copy = new IceCandidateMessage();
            copy.callId = callId;
            copy.opaque = candidate;
            message.iceCandidates.push(copy);
        }
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendLegacyHangup(remoteUserId, remoteDeviceId, callId, broadcast, hangupType, deviceId) {
        const message = new CallingMessage();
        message.legacyHangup = new HangupMessage();
        message.legacyHangup.callId = callId;
        message.legacyHangup.type = hangupType;
        message.legacyHangup.deviceId = deviceId || 0;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendHangup(remoteUserId, remoteDeviceId, callId, broadcast, hangupType, deviceId) {
        const message = new CallingMessage();
        message.hangup = new HangupMessage();
        message.hangup.callId = callId;
        message.hangup.type = hangupType;
        message.hangup.deviceId = deviceId || 0;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendBusy(remoteUserId, remoteDeviceId, callId, broadcast) {
        const message = new CallingMessage();
        message.busy = new BusyMessage();
        message.busy.callId = callId;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message) {
        message.supportsMultiRing = true;
        if (!broadcast) {
            message.destinationDeviceId = remoteDeviceId;
        }
        (() => __awaiter(this, void 0, void 0, function* () {
            if (this.handleOutgoingSignaling) {
                const signalingResult = yield this.handleOutgoingSignaling(remoteUserId, message);
                if (signalingResult) {
                    this.callManager.signalingMessageSent(callId);
                }
                else {
                    this.callManager.signalingMessageSendFailed(callId);
                }
            }
            else {
                this.callManager.signalingMessageSendFailed(callId);
            }
        }))();
    }
    receivedHttpResponse(requestId, status, body) {
        silly_deadlock_protection(() => {
            try {
                this.callManager.receivedHttpResponse(requestId, status, body);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        });
    }
    httpRequestFailed(requestId, debugInfo) {
        silly_deadlock_protection(() => {
            try {
                this.callManager.httpRequestFailed(requestId, debugInfo);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        });
    }
    // Group Calls
    // Called by UX
    getGroupCall(groupId, sfuUrl, observer) {
        const groupCall = new GroupCall(this.callManager, groupId, sfuUrl, observer);
        this._groupCallByClientId.set(groupCall.clientId, groupCall);
        return groupCall;
    }
    // Called by UX
    // Returns a list of user IDs
    peekGroupCall(sfu_url, membership_proof, group_members) {
        let [requestId, promise] = this._peekRequests.add();
        // Response comes back via handlePeekResponse
        silly_deadlock_protection(() => {
            this.callManager.peekGroupCall(requestId, sfu_url, membership_proof, group_members);
        });
        return promise;
    }
    // Called by Rust
    requestMembershipProof(clientId) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'requestMembershipProof(): GroupCall not found in map!');
                return;
            }
            groupCall.requestMembershipProof();
        });
    }
    // Called by Rust
    requestGroupMembers(clientId) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'requestGroupMembers(): GroupCall not found in map!');
                return;
            }
            groupCall.requestGroupMembers();
        });
    }
    // Called by Rust
    handleConnectionStateChanged(clientId, connectionState) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleConnectionStateChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleConnectionStateChanged(connectionState);
        });
    }
    // Called by Rust
    handleJoinStateChanged(clientId, joinState) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleJoinStateChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleJoinStateChanged(joinState);
        });
    }
    // Called by Rust
    handleNetworkRouteChanged(clientId, localNetworkAdapterType) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleNetworkRouteChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleNetworkRouteChanged(localNetworkAdapterType);
        });
    }
    // Called by Rust
    handleRemoteDevicesChanged(clientId, remoteDeviceStates) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleRemoteDevicesChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleRemoteDevicesChanged(remoteDeviceStates);
        });
    }
    // Called by Rust
    handlePeekChanged(clientId, info) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handlePeekChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handlePeekChanged(info);
        });
    }
    // Called by Rust
    handlePeekResponse(request_id, info) {
        silly_deadlock_protection(() => {
            if (!this._peekRequests.resolve(request_id, info)) {
                this.onLogMessage(CallLogLevel.Warn, 'Service.ts', 0, `Invalid request ID for handlePeekResponse: ${request_id}`);
            }
        });
    }
    // Called by Rust
    handleEnded(clientId, reason) {
        silly_deadlock_protection(() => {
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleEnded(): GroupCall not found in map!');
                return;
            }
            this._groupCallByClientId.delete(clientId);
            groupCall.handleEnded(reason);
        });
    }
    // Called by Rust
    groupCallRingUpdate(groupId, ringIdString, sender, state) {
        silly_deadlock_protection(() => {
            if (this.handleGroupCallRingUpdate) {
                const ringId = BigInt(ringIdString);
                this.handleGroupCallRingUpdate(groupId, ringId, sender, state);
            }
            else {
                console.log('RingRTC.handleGroupCallRingUpdate is not set!');
            }
        });
    }
    // Called by Rust
    onLogMessage(level, fileName, line, message) {
        if (this.handleLogMessage) {
            this.handleLogMessage(level, fileName, line, message);
        }
    }
    // Called by MessageReceiver
    // tslint:disable-next-line cyclomatic-complexity
    handleCallingMessage(remoteUserId, remoteUuid, remoteDeviceId, localDeviceId, messageAgeSec, message, senderIdentityKey, receiverIdentityKey) {
        const remoteSupportsMultiRing = message.supportsMultiRing || false;
        if (message.destinationDeviceId &&
            message.destinationDeviceId !== localDeviceId) {
            // Drop the message as it isn't for this device, handleIgnoredCall() is not needed.
            return;
        }
        if (message.offer && message.offer.callId) {
            const callId = message.offer.callId;
            const opaque = to_buffer(message.offer.opaque);
            // opaque is required. sdp is obsolete, but it might still come with opaque.
            if (!opaque) {
                // TODO: Remove once the proto is updated to only support opaque and require it.
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleCallingMessage(): opaque not received for offer, remote should update');
                return;
            }
            const offerType = message.offer.type || OfferType.AudioCall;
            this.callManager.receivedOffer(remoteUserId, remoteDeviceId, localDeviceId, messageAgeSec, callId, offerType, remoteSupportsMultiRing, opaque, senderIdentityKey, receiverIdentityKey);
        }
        if (message.answer && message.answer.callId) {
            const callId = message.answer.callId;
            const opaque = to_buffer(message.answer.opaque);
            // opaque is required. sdp is obsolete, but it might still come with opaque.
            if (!opaque) {
                // TODO: Remove once the proto is updated to only support opaque and require it.
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleCallingMessage(): opaque not received for answer, remote should update');
                return;
            }
            this.callManager.receivedAnswer(remoteUserId, remoteDeviceId, callId, remoteSupportsMultiRing, opaque, senderIdentityKey, receiverIdentityKey);
        }
        if (message.iceCandidates && message.iceCandidates.length > 0) {
            // We assume they all have the same .callId
            let callId = message.iceCandidates[0].callId;
            // We have to copy them to do the .toArrayBuffer() thing.
            const candidates = [];
            for (const candidate of message.iceCandidates) {
                const copy = to_buffer(candidate.opaque);
                if (copy) {
                    candidates.push(copy);
                }
                else {
                    // TODO: Remove once the proto is updated to only support opaque and require it.
                    this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleCallingMessage(): opaque not received for ice candidate, remote should update');
                    continue;
                }
            }
            if (candidates.length == 0) {
                this.onLogMessage(CallLogLevel.Warn, 'Service.ts', 0, 'handleCallingMessage(): No ice candidates in ice message, remote should update');
                return;
            }
            this.callManager.receivedIceCandidates(remoteUserId, remoteDeviceId, callId, candidates);
        }
        if (message.hangup && message.hangup.callId) {
            const callId = message.hangup.callId;
            const hangupType = message.hangup.type || HangupType.Normal;
            const hangupDeviceId = message.hangup.deviceId || null;
            this.callManager.receivedHangup(remoteUserId, remoteDeviceId, callId, hangupType, hangupDeviceId);
        }
        if (message.legacyHangup && message.legacyHangup.callId) {
            const callId = message.legacyHangup.callId;
            const hangupType = message.legacyHangup.type || HangupType.Normal;
            const hangupDeviceId = message.legacyHangup.deviceId || null;
            this.callManager.receivedHangup(remoteUserId, remoteDeviceId, callId, hangupType, hangupDeviceId);
        }
        if (message.busy && message.busy.callId) {
            const callId = message.busy.callId;
            this.callManager.receivedBusy(remoteUserId, remoteDeviceId, callId);
        }
        if (message.opaque) {
            if (remoteUuid == null) {
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleCallingMessage(): opaque message received without UUID!');
                return;
            }
            const data = to_buffer(message.opaque.data);
            if (data == undefined) {
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleCallingMessage(): opaque message received without data!');
                return;
            }
            this.callManager.receivedCallMessage(remoteUuid, remoteDeviceId, localDeviceId, data, messageAgeSec);
        }
    }
    // Called by Rust
    sendHttpRequest(requestId, url, method, headers, body) {
        if (this.handleSendHttpRequest) {
            this.handleSendHttpRequest(requestId, url, method, headers, body);
        }
        else {
            console.log('RingRTC.handleSendHttpRequest is not set!');
        }
    }
    // Called by Rust
    sendCallMessage(recipientUuid, message, urgency) {
        if (this.handleSendCallMessage) {
            this.handleSendCallMessage(recipientUuid, message, urgency);
        }
        else {
            console.log('RingRTC.handleSendCallMessage is not set!');
        }
    }
    // Called by Rust
    sendCallMessageToGroup(groupId, message, urgency) {
        if (this.handleSendCallMessageToGroup) {
            this.handleSendCallMessageToGroup(groupId, message, urgency);
        }
        else {
            console.log('RingRTC.handleSendCallMessageToGroup is not set!');
        }
    }
    // These are convenience methods.  One could use the Call class instead.
    get call() {
        return this._call;
    }
    getCall(callId) {
        const { call } = this;
        if (call &&
            call.callId.high === callId.high &&
            call.callId.low === call.callId.low) {
            return call;
        }
        return null;
    }
    accept(callId, asVideoCall) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.accept();
        call.outgoingAudioEnabled = true;
        call.outgoingVideoEnabled = asVideoCall;
    }
    decline(callId) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.decline();
    }
    ignore(callId) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.ignore();
    }
    hangup(callId) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.hangup();
    }
    setOutgoingAudio(callId, enabled) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.outgoingAudioEnabled = enabled;
    }
    setOutgoingVideo(callId, enabled) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.outgoingVideoEnabled = enabled;
    }
    setOutgoingVideoIsScreenShare(callId, isScreenShare) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.outgoingVideoIsScreenShare = isScreenShare;
    }
    setVideoCapturer(callId, capturer) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.videoCapturer = capturer;
    }
    setVideoRenderer(callId, renderer) {
        const call = this.getCall(callId);
        if (!call) {
            return;
        }
        call.videoRenderer = renderer;
    }
    getAudioInputs() {
        return this.callManager.getAudioInputs();
    }
    setAudioInput(index) {
        this.callManager.setAudioInput(index);
    }
    getAudioOutputs() {
        return this.callManager.getAudioOutputs();
    }
    setAudioOutput(index) {
        this.callManager.setAudioOutput(index);
    }
}
exports.RingRTCType = RingRTCType;
class Call {
    constructor(callManager, remoteUserId, callId, isIncoming, isVideoCall, settings, state) {
        this._outgoingAudioEnabled = false;
        this._outgoingVideoEnabled = false;
        this._outgoingVideoIsScreenShare = false;
        this._remoteVideoEnabled = false;
        this.remoteSharingScreen = false;
        this.networkRoute = new NetworkRoute();
        this._videoCapturer = null;
        this._videoRenderer = null;
        this._callManager = callManager;
        this._remoteUserId = remoteUserId;
        this.callId = callId;
        this._isIncoming = isIncoming;
        this._isVideoCall = isVideoCall;
        this.settings = settings;
        this._state = state;
    }
    get remoteUserId() {
        return this._remoteUserId;
    }
    get isIncoming() {
        return this._isIncoming;
    }
    get isVideoCall() {
        return this._isVideoCall;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        if (state == this._state) {
            return;
        }
        this._state = state;
        this.enableOrDisableCapturer();
        this.enableOrDisableRenderer();
        if (!!this.handleStateChanged) {
            this.handleStateChanged();
        }
    }
    set videoCapturer(capturer) {
        this._videoCapturer = capturer;
        this.enableOrDisableCapturer();
    }
    set videoRenderer(renderer) {
        this._videoRenderer = renderer;
        this.enableOrDisableRenderer();
    }
    accept() {
        this._callManager.accept(this.callId);
    }
    decline() {
        this.hangup();
    }
    ignore() {
        this._callManager.ignore(this.callId);
    }
    hangup() {
        // This is a little faster than waiting for the
        // change in call state to come back.
        if (this._videoCapturer) {
            this._videoCapturer.disable();
        }
        if (this._videoRenderer) {
            this._videoRenderer.disable();
        }
        // This assumes we only have one active call.
        silly_deadlock_protection(() => {
            this._callManager.hangup();
        });
    }
    get outgoingAudioEnabled() {
        return this._outgoingAudioEnabled;
    }
    set outgoingAudioEnabled(enabled) {
        this._outgoingAudioEnabled = enabled;
        // This assumes we only have one active call.
        silly_deadlock_protection(() => {
            this._callManager.setOutgoingAudioEnabled(enabled);
        });
    }
    get outgoingVideoEnabled() {
        return this._outgoingVideoEnabled;
    }
    set outgoingVideoEnabled(enabled) {
        this._outgoingVideoEnabled = enabled;
        this.enableOrDisableCapturer();
    }
    set outgoingVideoIsScreenShare(isScreenShare) {
        // This assumes we only have one active call.
        this._outgoingVideoIsScreenShare = isScreenShare;
        silly_deadlock_protection(() => {
            this._callManager.setOutgoingVideoIsScreenShare(isScreenShare);
        });
    }
    get remoteVideoEnabled() {
        return this._remoteVideoEnabled;
    }
    set remoteVideoEnabled(enabled) {
        this._remoteVideoEnabled = enabled;
        this.enableOrDisableRenderer();
    }
    // With this method, a Call is a VideoFrameSender
    sendVideoFrame(width, height, rgbaBuffer) {
        // This assumes we only have one active all.
        this._callManager.sendVideoFrame(width, height, rgbaBuffer);
    }
    // With this method, a Call is a VideoFrameSource
    receiveVideoFrame(buffer) {
        // This assumes we only have one active all.
        return this._callManager.receiveVideoFrame(buffer);
    }
    enableOrDisableCapturer() {
        if (!this._videoCapturer) {
            return;
        }
        if (!this.outgoingVideoEnabled) {
            this._videoCapturer.disable();
            if (this.state === CallState.Accepted) {
                this.setOutgoingVideoEnabled(false);
            }
            return;
        }
        switch (this.state) {
            case CallState.Prering:
            case CallState.Ringing:
                this._videoCapturer.enableCapture();
                break;
            case CallState.Accepted:
                this._videoCapturer.enableCaptureAndSend(this);
                this.setOutgoingVideoEnabled(true);
                if (this._outgoingVideoIsScreenShare) {
                    // Make sure the status gets sent.
                    this.outgoingVideoIsScreenShare = true;
                }
                break;
            case CallState.Reconnecting:
                this._videoCapturer.enableCaptureAndSend(this);
                // Don't send status until we're reconnected.
                break;
            case CallState.Ended:
                this._videoCapturer.disable();
                break;
            default:
        }
    }
    setOutgoingVideoEnabled(enabled) {
        silly_deadlock_protection(() => {
            try {
                this._callManager.setOutgoingVideoEnabled(enabled);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        });
    }
    updateBandwidthMode(bandwidthMode) {
        silly_deadlock_protection(() => {
            try {
                this._callManager.updateBandwidthMode(bandwidthMode);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        });
    }
    enableOrDisableRenderer() {
        if (!this._videoRenderer) {
            return;
        }
        if (!this.remoteVideoEnabled) {
            this._videoRenderer.disable();
            return;
        }
        switch (this.state) {
            case CallState.Prering:
            case CallState.Ringing:
                this._videoRenderer.disable();
                break;
            case CallState.Accepted:
            case CallState.Reconnecting:
                this._videoRenderer.enable(this);
                break;
            case CallState.Ended:
                this._videoRenderer.disable();
                break;
            default:
        }
    }
}
exports.Call = Call;
// Represents the connection state to a media server for a group call.
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["NotConnected"] = 0] = "NotConnected";
    ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";
    ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
    ConnectionState[ConnectionState["Reconnecting"] = 3] = "Reconnecting";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
// Represents whether or not a user is joined to a group call and can exchange media.
var JoinState;
(function (JoinState) {
    JoinState[JoinState["NotJoined"] = 0] = "NotJoined";
    JoinState[JoinState["Joining"] = 1] = "Joining";
    JoinState[JoinState["Joined"] = 2] = "Joined";
})(JoinState = exports.JoinState || (exports.JoinState = {}));
// If not ended purposely by the user, gives the reason why a group call ended.
var GroupCallEndReason;
(function (GroupCallEndReason) {
    // Normal events
    GroupCallEndReason[GroupCallEndReason["DeviceExplicitlyDisconnected"] = 0] = "DeviceExplicitlyDisconnected";
    GroupCallEndReason[GroupCallEndReason["ServerExplicitlyDisconnected"] = 1] = "ServerExplicitlyDisconnected";
    // Things that can go wrong
    GroupCallEndReason[GroupCallEndReason["CallManagerIsBusy"] = 2] = "CallManagerIsBusy";
    GroupCallEndReason[GroupCallEndReason["SfuClientFailedToJoin"] = 3] = "SfuClientFailedToJoin";
    GroupCallEndReason[GroupCallEndReason["FailedToCreatePeerConnectionFactory"] = 4] = "FailedToCreatePeerConnectionFactory";
    GroupCallEndReason[GroupCallEndReason["FailedToGenerateCertificate"] = 5] = "FailedToGenerateCertificate";
    GroupCallEndReason[GroupCallEndReason["FailedToCreatePeerConnection"] = 6] = "FailedToCreatePeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToCreateDataChannel"] = 7] = "FailedToCreateDataChannel";
    GroupCallEndReason[GroupCallEndReason["FailedToStartPeerConnection"] = 8] = "FailedToStartPeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToUpdatePeerConnection"] = 9] = "FailedToUpdatePeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToSetMaxSendBitrate"] = 10] = "FailedToSetMaxSendBitrate";
    GroupCallEndReason[GroupCallEndReason["IceFailedWhileConnecting"] = 11] = "IceFailedWhileConnecting";
    GroupCallEndReason[GroupCallEndReason["IceFailedAfterConnected"] = 12] = "IceFailedAfterConnected";
    GroupCallEndReason[GroupCallEndReason["ServerChangedDemuxId"] = 13] = "ServerChangedDemuxId";
    GroupCallEndReason[GroupCallEndReason["HasMaxDevices"] = 14] = "HasMaxDevices";
})(GroupCallEndReason = exports.GroupCallEndReason || (exports.GroupCallEndReason = {}));
var CallMessageUrgency;
(function (CallMessageUrgency) {
    CallMessageUrgency[CallMessageUrgency["Droppable"] = 0] = "Droppable";
    CallMessageUrgency[CallMessageUrgency["HandleImmediately"] = 1] = "HandleImmediately";
})(CallMessageUrgency = exports.CallMessageUrgency || (exports.CallMessageUrgency = {}));
var RingUpdate;
(function (RingUpdate) {
    /// The sender is trying to ring this user.
    RingUpdate[RingUpdate["Requested"] = 0] = "Requested";
    /// The sender tried to ring this user, but it's been too long.
    RingUpdate[RingUpdate["ExpiredRequest"] = 1] = "ExpiredRequest";
    /// Call was accepted elsewhere by a different device.
    RingUpdate[RingUpdate["AcceptedOnAnotherDevice"] = 2] = "AcceptedOnAnotherDevice";
    /// Call was declined elsewhere by a different device.
    RingUpdate[RingUpdate["DeclinedOnAnotherDevice"] = 3] = "DeclinedOnAnotherDevice";
    /// This device is currently on a different call.
    RingUpdate[RingUpdate["BusyLocally"] = 4] = "BusyLocally";
    /// A different device is currently on a different call.
    RingUpdate[RingUpdate["BusyOnAnotherDevice"] = 5] = "BusyOnAnotherDevice";
    /// The sender cancelled the ring request.
    RingUpdate[RingUpdate["CancelledByRinger"] = 6] = "CancelledByRinger";
})(RingUpdate = exports.RingUpdate || (exports.RingUpdate = {}));
// HTTP request methods.
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["Get"] = 0] = "Get";
    HttpMethod[HttpMethod["Put"] = 1] = "Put";
    HttpMethod[HttpMethod["Post"] = 2] = "Post";
    HttpMethod[HttpMethod["Delete"] = 3] = "Delete";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
// The local device state for a group call.
class LocalDeviceState {
    constructor() {
        this.connectionState = ConnectionState.NotConnected;
        this.joinState = JoinState.NotJoined;
        // By default audio and video are muted.
        this.audioMuted = true;
        this.videoMuted = true;
        this.presenting = false;
        this.sharingScreen = false;
        this.networkRoute = new NetworkRoute();
    }
}
exports.LocalDeviceState = LocalDeviceState;
// All remote devices in a group call and their associated state.
class RemoteDeviceState {
    constructor(demuxId, userId, mediaKeysReceived) {
        this.demuxId = demuxId;
        this.userId = userId;
        this.mediaKeysReceived = mediaKeysReceived;
    }
}
exports.RemoteDeviceState = RemoteDeviceState;
// Used to communicate the group membership to RingRTC for a group call.
class GroupMemberInfo {
    constructor(userId, userIdCipherText) {
        this.userId = userId;
        this.userIdCipherText = userIdCipherText;
    }
}
exports.GroupMemberInfo = GroupMemberInfo;
// Used for the application to communicate the actual resolutions of
// each device in a group call to RingRTC and the SFU.
class VideoRequest {
    constructor(demuxId, width, height, framerate) {
        this.demuxId = demuxId;
        this.width = width;
        this.height = height;
        this.framerate = framerate;
    }
}
exports.VideoRequest = VideoRequest;
class GroupCall {
    // Called by UI via RingRTC object
    constructor(callManager, groupId, sfuUrl, observer) {
        this._callManager = callManager;
        this._observer = observer;
        this._localDeviceState = new LocalDeviceState();
        this._clientId = this._callManager.createGroupCallClient(groupId, sfuUrl);
    }
    get clientId() {
        return this._clientId;
    }
    // Called by UI
    connect() {
        this._callManager.connect(this._clientId);
    }
    // Called by UI
    join() {
        this._callManager.join(this._clientId);
    }
    // Called by UI
    leave() {
        this._callManager.leave(this._clientId);
    }
    // Called by UI
    disconnect() {
        this._callManager.disconnect(this._clientId);
    }
    // Called by UI
    getLocalDeviceState() {
        return this._localDeviceState;
    }
    // Called by UI
    getRemoteDeviceStates() {
        return this._remoteDeviceStates;
    }
    // Called by UI
    getPeekInfo() {
        return this._peekInfo;
    }
    // Called by UI
    setOutgoingAudioMuted(muted) {
        this._localDeviceState.audioMuted = muted;
        this._callManager.setOutgoingAudioMuted(this._clientId, muted);
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by UI
    setOutgoingVideoMuted(muted) {
        this._localDeviceState.videoMuted = muted;
        this._callManager.setOutgoingVideoMuted(this._clientId, muted);
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by UI
    setPresenting(presenting) {
        this._localDeviceState.presenting = presenting;
        this._callManager.setPresenting(this._clientId, presenting);
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by UI
    setOutgoingVideoIsScreenShare(isScreenShare) {
        this._localDeviceState.sharingScreen = isScreenShare;
        this._callManager.setOutgoingGroupCallVideoIsScreenShare(this._clientId, isScreenShare);
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by UI
    ringAll() {
        this._callManager.groupRing(this._clientId, undefined);
    }
    // Called by UI
    resendMediaKeys() {
        this._callManager.resendMediaKeys(this._clientId);
    }
    // Called by UI
    setBandwidthMode(bandwidthMode) {
        this._callManager.setBandwidthMode(this._clientId, bandwidthMode);
    }
    // Called by UI
    requestVideo(resolutions) {
        this._callManager.requestVideo(this._clientId, resolutions);
    }
    // Called by UI
    setGroupMembers(members) {
        this._callManager.setGroupMembers(this._clientId, members);
    }
    // Called by UI
    setMembershipProof(proof) {
        this._callManager.setMembershipProof(this._clientId, proof);
    }
    // Called by Rust via RingRTC object
    requestMembershipProof() {
        this._observer.requestMembershipProof(this);
    }
    // Called by Rust via RingRTC object
    requestGroupMembers() {
        this._observer.requestGroupMembers(this);
    }
    // Called by Rust via RingRTC object
    handleConnectionStateChanged(connectionState) {
        this._localDeviceState.connectionState = connectionState;
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by Rust via RingRTC object
    handleJoinStateChanged(joinState) {
        this._localDeviceState.joinState = joinState;
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by Rust via RingRTC object
    handleNetworkRouteChanged(localNetworkAdapterType) {
        this._localDeviceState.networkRoute.localAdapterType = localNetworkAdapterType;
        this._observer.onLocalDeviceStateChanged(this);
    }
    // Called by Rust via RingRTC object
    handleRemoteDevicesChanged(remoteDeviceStates) {
        var _a;
        // We don't get aspect ratios from RingRTC, so make sure to copy them over.
        for (const noo of remoteDeviceStates) {
            const old = (_a = this._remoteDeviceStates) === null || _a === void 0 ? void 0 : _a.find(old => old.demuxId == noo.demuxId);
            noo.videoAspectRatio = old === null || old === void 0 ? void 0 : old.videoAspectRatio;
        }
        this._remoteDeviceStates = remoteDeviceStates;
        this._observer.onRemoteDeviceStatesChanged(this);
    }
    // Called by Rust via RingRTC object
    handlePeekChanged(info) {
        this._peekInfo = info;
        this._observer.onPeekChanged(this);
    }
    // Called by Rust via RingRTC object
    handleEnded(reason) {
        this._observer.onEnded(this, reason);
        this._callManager.deleteGroupCallClient(this._clientId);
    }
    // With this, a GroupCall is a VideoFrameSender
    sendVideoFrame(width, height, rgbaBuffer) {
        // This assumes we only have one active all.
        this._callManager.sendVideoFrame(width, height, rgbaBuffer);
    }
    // With this, a GroupCall can provide a VideoFrameSource for each remote device.
    getVideoSource(remoteDemuxId) {
        return new GroupCallVideoFrameSource(this._callManager, this, remoteDemuxId);
    }
    // Called by the GroupCallVideoFrameSource when it receives a video frame.
    setRemoteAspectRatio(remoteDemuxId, aspectRatio) {
        var _a;
        const remoteDevice = (_a = this._remoteDeviceStates) === null || _a === void 0 ? void 0 : _a.find(device => device.demuxId == remoteDemuxId);
        if (!!remoteDevice && remoteDevice.videoAspectRatio != aspectRatio) {
            remoteDevice.videoAspectRatio = aspectRatio;
            this._observer.onRemoteDeviceStatesChanged(this);
        }
    }
}
exports.GroupCall = GroupCall;
// Implements VideoSource for use in CanvasVideoRenderer
class GroupCallVideoFrameSource {
    constructor(callManager, groupCall, remoteDemuxId // Uint32
    ) {
        this._callManager = callManager;
        this._groupCall = groupCall;
        this._remoteDemuxId = remoteDemuxId;
    }
    receiveVideoFrame(buffer) {
        // This assumes we only have one active all.
        const frame = this._callManager.receiveGroupCallVideoFrame(this._groupCall.clientId, this._remoteDemuxId, buffer);
        if (!!frame) {
            const [width, height] = frame;
            this._groupCall.setRemoteAspectRatio(this._remoteDemuxId, width / height);
        }
        return frame;
    }
}
function to_buffer(pbab) {
    if (!pbab) {
        return pbab;
    }
    if (pbab instanceof Buffer) {
        return pbab;
    }
    return Buffer.from(pbab.toArrayBuffer());
}
class CallingMessage {
}
exports.CallingMessage = CallingMessage;
class OfferMessage {
}
exports.OfferMessage = OfferMessage;
var OfferType;
(function (OfferType) {
    OfferType[OfferType["AudioCall"] = 0] = "AudioCall";
    OfferType[OfferType["VideoCall"] = 1] = "VideoCall";
})(OfferType = exports.OfferType || (exports.OfferType = {}));
class AnswerMessage {
}
exports.AnswerMessage = AnswerMessage;
class IceCandidateMessage {
}
exports.IceCandidateMessage = IceCandidateMessage;
class BusyMessage {
}
exports.BusyMessage = BusyMessage;
class HangupMessage {
}
exports.HangupMessage = HangupMessage;
class OpaqueMessage {
}
exports.OpaqueMessage = OpaqueMessage;
var HangupType;
(function (HangupType) {
    HangupType[HangupType["Normal"] = 0] = "Normal";
    HangupType[HangupType["Accepted"] = 1] = "Accepted";
    HangupType[HangupType["Declined"] = 2] = "Declined";
    HangupType[HangupType["Busy"] = 3] = "Busy";
    HangupType[HangupType["NeedPermission"] = 4] = "NeedPermission";
})(HangupType = exports.HangupType || (exports.HangupType = {}));
var BandwidthMode;
(function (BandwidthMode) {
    BandwidthMode[BandwidthMode["VeryLow"] = 0] = "VeryLow";
    BandwidthMode[BandwidthMode["Low"] = 1] = "Low";
    BandwidthMode[BandwidthMode["Normal"] = 2] = "Normal";
})(BandwidthMode = exports.BandwidthMode || (exports.BandwidthMode = {}));
/// Describes why a ring was cancelled.
var RingCancelReason;
(function (RingCancelReason) {
    /// The user explicitly clicked "Decline".
    RingCancelReason[RingCancelReason["DeclinedByUser"] = 0] = "DeclinedByUser";
    /// The device is busy with another call.
    RingCancelReason[RingCancelReason["Busy"] = 1] = "Busy";
})(RingCancelReason = exports.RingCancelReason || (exports.RingCancelReason = {}));
var CallState;
(function (CallState) {
    CallState["Prering"] = "init";
    CallState["Ringing"] = "ringing";
    CallState["Accepted"] = "connected";
    CallState["Reconnecting"] = "connecting";
    CallState["Ended"] = "ended";
})(CallState = exports.CallState || (exports.CallState = {}));
var CallEndedReason;
(function (CallEndedReason) {
    CallEndedReason["LocalHangup"] = "LocalHangup";
    CallEndedReason["RemoteHangup"] = "RemoteHangup";
    CallEndedReason["RemoteHangupNeedPermission"] = "RemoteHangupNeedPermission";
    CallEndedReason["Declined"] = "Declined";
    CallEndedReason["Busy"] = "Busy";
    CallEndedReason["Glare"] = "Glare";
    CallEndedReason["ReceivedOfferExpired"] = "ReceivedOfferExpired";
    CallEndedReason["ReceivedOfferWhileActive"] = "ReceivedOfferWhileActive";
    CallEndedReason["ReceivedOfferWithGlare"] = "ReceivedOfferWithGlare";
    CallEndedReason["SignalingFailure"] = "SignalingFailure";
    CallEndedReason["ConnectionFailure"] = "ConnectionFailure";
    CallEndedReason["InternalFailure"] = "InternalFailure";
    CallEndedReason["Timeout"] = "Timeout";
    CallEndedReason["AcceptedOnAnotherDevice"] = "AcceptedOnAnotherDevice";
    CallEndedReason["DeclinedOnAnotherDevice"] = "DeclinedOnAnotherDevice";
    CallEndedReason["BusyOnAnotherDevice"] = "BusyOnAnotherDevice";
    CallEndedReason["CallerIsNotMultiring"] = "CallerIsNotMultiring";
})(CallEndedReason = exports.CallEndedReason || (exports.CallEndedReason = {}));
var CallLogLevel;
(function (CallLogLevel) {
    CallLogLevel[CallLogLevel["Off"] = 0] = "Off";
    CallLogLevel[CallLogLevel["Error"] = 1] = "Error";
    CallLogLevel[CallLogLevel["Warn"] = 2] = "Warn";
    CallLogLevel[CallLogLevel["Info"] = 3] = "Info";
    CallLogLevel[CallLogLevel["Debug"] = 4] = "Debug";
    CallLogLevel[CallLogLevel["Trace"] = 5] = "Trace";
})(CallLogLevel = exports.CallLogLevel || (exports.CallLogLevel = {}));
function silly_deadlock_protection(f) {
    // tslint:disable no-floating-promises
    (() => __awaiter(this, void 0, void 0, function* () {
        // This is a silly way of preventing a deadlock.
        // tslint:disable-next-line await-promise
        yield 0;
        f();
    }))();
}
