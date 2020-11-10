"use strict";
//
// Copyright (C) 2020 Signal Messenger, LLC.
// All rights reserved.
//
// SPDX-License-Identifier: GPL-3.0-only
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
/* tslint:disable max-classes-per-file */
const os = require('os');
// tslint:disable-next-line no-var-requires no-require-imports
const Native = require('../../build/' + os.platform() + '/libringrtc.node');
class RingRTCType {
    constructor() {
        // Set by UX
        this.handleOutgoingSignaling = null;
        this.handleIncomingCall = null;
        this.handleAutoEndedIncomingCallRequest = null;
        this.handleLogMessage = null;
        this.handleSendHttpRequest = null;
        this.handleSendCallMessage = null;
        this.callManager = new Native.CallManager();
        this._call = null;
        this._groupCallByClientId = new Map();
        this.pollEvery(50);
    }
    pollEvery(intervalMs) {
        this.callManager.poll(this);
        setTimeout(() => {
            this.pollEvery(intervalMs);
        }, intervalMs);
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
        // tslint:disable no-floating-promises
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of causing a deadlock.
            // tslint:disable-next-line await-promise
            yield 0;
            this.callManager.proceed(callId, settings.iceServer.username || '', settings.iceServer.password || '', settings.iceServer.urls, settings.hideIp);
        }))();
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
        if (call && (reason === CallEndedReason.ReceivedOfferWithGlare || reason === CallEndedReason.Glare)) {
            call.hangup();
        }
        // If there is no call or the remoteUserId doesn't match that of
        // the current call, or if one of the "receive offer while alread
        // in a call" reasons are provided, don't end the current call, 
        // just update the call history.
        if (!call ||
            (call.remoteUserId !== remoteUserId) ||
            (reason === CallEndedReason.ReceivedOfferWhileActive) ||
            (reason === CallEndedReason.ReceivedOfferExpired)) {
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
    onSendOffer(remoteUserId, remoteDeviceId, callId, broadcast, offerType, opaque, sdp) {
        const message = new CallingMessage();
        message.offer = new OfferMessage();
        message.offer.callId = callId;
        message.offer.type = offerType;
        message.offer.opaque = opaque;
        message.offer.sdp = sdp;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendAnswer(remoteUserId, remoteDeviceId, callId, broadcast, opaque, sdp) {
        const message = new CallingMessage();
        message.answer = new AnswerMessage();
        message.answer.callId = callId;
        message.answer.opaque = opaque;
        message.answer.sdp = sdp;
        this.sendSignaling(remoteUserId, remoteDeviceId, callId, broadcast, message);
    }
    // Called by Rust
    onSendIceCandidates(remoteUserId, remoteDeviceId, callId, broadcast, candidates) {
        const message = new CallingMessage();
        message.iceCandidates = [];
        for (const candidate of candidates) {
            const copy = new IceCandidateMessage();
            copy.callId = callId;
            // TODO: Remove this once all old clients are gone (along with .sdp below)
            copy.mid = "audio";
            copy.line = 0;
            copy.opaque = candidate.opaque;
            copy.sdp = candidate.sdp;
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
        this.callManager.receivedHttpResponse(requestId, status, body);
    }
    httpRequestFailed(requestId, debugInfo) {
        this.callManager.httpRequestFailed(requestId, debugInfo);
    }
    // Group Calls
    // Called by UX
    getGroupCall(groupId, observer) {
        const groupCall = new GroupCall(this.callManager, groupId, observer);
        this._groupCallByClientId.set(groupCall.clientId, groupCall);
        return groupCall;
    }
    // Called by Rust
    requestMembershipProof(clientId) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'requestMembershipProof(): GroupCall not found in map!');
                return;
            }
            groupCall.requestMembershipProof();
        }))();
    }
    // Called by Rust
    requestGroupMembers(clientId) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'requestGroupMembers(): GroupCall not found in map!');
                return;
            }
            groupCall.requestGroupMembers();
        }))();
    }
    // Called by Rust
    handleConnectionStateChanged(clientId, connectionState) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleConnectionStateChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleConnectionStateChanged(connectionState);
        }))();
    }
    // Called by Rust
    handleJoinStateChanged(clientId, joinState) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleJoinStateChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleJoinStateChanged(joinState);
        }))();
    }
    // Called by Rust
    handleRemoteDevicesChanged(clientId, remoteDeviceStates) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleRemoteDevicesChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleRemoteDevicesChanged(remoteDeviceStates);
        }))();
    }
    // Called by Rust
    handleJoinedMembersChanged(clientId, members) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleJoinedMembersChanged(): GroupCall not found in map!');
                return;
            }
            groupCall.handleJoinedMembersChanged(members);
        }))();
    }
    // Called by Rust
    handleEnded(clientId, reason) {
        (() => __awaiter(this, void 0, void 0, function* () {
            yield 0;
            let groupCall = this._groupCallByClientId.get(clientId);
            if (!groupCall) {
                let error = new Error();
                this.onLogMessage(CallLogLevel.Error, 'Service.ts', 0, 'handleEnded(): GroupCall not found in map!');
                return;
            }
            this._groupCallByClientId.delete(clientId);
            groupCall.handleEnded(reason);
        }))();
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
        if (message.destinationDeviceId && message.destinationDeviceId !== localDeviceId) {
            // Drop the message as it isn't for this device, handleIgnoredCall() is not needed.
            return;
        }
        if (message.offer && message.offer.callId) {
            const callId = message.offer.callId;
            const opaque = to_array_buffer(message.offer.opaque);
            const sdp = message.offer.sdp;
            const offerType = message.offer.type || OfferType.AudioCall;
            this.callManager.receivedOffer(remoteUserId, remoteDeviceId, localDeviceId, messageAgeSec, callId, offerType, remoteSupportsMultiRing, opaque, sdp, senderIdentityKey, receiverIdentityKey);
        }
        if (message.answer && message.answer.callId) {
            const callId = message.answer.callId;
            const opaque = to_array_buffer(message.answer.opaque);
            const sdp = message.answer.sdp;
            this.callManager.receivedAnswer(remoteUserId, remoteDeviceId, callId, remoteSupportsMultiRing, opaque, sdp, senderIdentityKey, receiverIdentityKey);
        }
        if (message.iceCandidates && message.iceCandidates.length > 0) {
            // We assume they all have the same .callId
            let callId = message.iceCandidates[0].callId;
            // We have to copy them to do the .toArrayBuffer() thing.
            const candidates = [];
            for (const candidate of message.iceCandidates) {
                const copy = new IceCandidateMessage();
                // TODO: Remove this once all old clients are gone (along with .sdp below)
                // Actually, I don't think we need this at all, but it's safer just to leave it
                // temporariliy.
                copy.mid = "audio";
                copy.line = 0;
                copy.opaque = to_array_buffer(candidate.opaque);
                copy.sdp = candidate.sdp;
                candidates.push(copy);
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
            const data = to_array_buffer(message.opaque.data);
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
            console.log("RingRTC.handleSendHttpRequest is not set!");
        }
    }
    // Called by Rust
    sendCallMessage(recipientUuid, message) {
        if (this.handleSendCallMessage) {
            this.handleSendCallMessage(recipientUuid, message);
        }
        else {
            console.log("RingRTC.handleSendCallMessage is not set!");
        }
    }
    // These are convenience methods.  One could use the Call class instead.
    get call() {
        return this._call;
    }
    getCall(callId) {
        const { call } = this;
        if (call && call.callId.high === callId.high && call.callId.low === call.callId.low) {
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
        this._remoteVideoEnabled = false;
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
        // This assumes we only have one active all.
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of causing a deadlock.
            // tslint:disable-next-line await-promise
            yield 0;
            this._callManager.hangup();
        }))();
    }
    get outgoingAudioEnabled() {
        return this._outgoingAudioEnabled;
    }
    set outgoingAudioEnabled(enabled) {
        this._outgoingAudioEnabled = enabled;
        // This assumes we only have one active all.
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of not causing a deadlock.
            // tslint:disable-next-line await-promise
            yield 0;
            this._callManager.setOutgoingAudioEnabled(enabled);
        }))();
    }
    get outgoingVideoEnabled() {
        return this._outgoingVideoEnabled;
    }
    set outgoingVideoEnabled(enabled) {
        this._outgoingVideoEnabled = enabled;
        this.enableOrDisableCapturer();
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
                this.sendVideoStatus(false);
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
                this.sendVideoStatus(true);
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
    sendVideoStatus(enabled) {
        // tslint:disable no-floating-promises
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of causing a deadlock.
            // tslint:disable-next-line await-promise
            yield 0;
            try {
                this._callManager.sendVideoStatus(enabled);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        }))();
    }
    setLowBandwidthMode(enabled) {
        // tslint:disable no-floating-promises
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of causing a deadlock.
            // tslint:disable-next-line await-promise
            yield 0;
            try {
                this._callManager.setLowBandwidthMode(enabled);
            }
            catch (_a) {
                // We may not have an active connection any more.
                // In which case it doesn't matter
            }
        }))();
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
// Bandwidth mode for limiting network bandwidth between the device and media server.
var BandwidthMode;
(function (BandwidthMode) {
    BandwidthMode[BandwidthMode["Low"] = 0] = "Low";
    BandwidthMode[BandwidthMode["Normal"] = 1] = "Normal";
})(BandwidthMode = exports.BandwidthMode || (exports.BandwidthMode = {}));
// If not ended purposely by the user, gives the reason why a group call ended.
var GroupCallEndReason;
(function (GroupCallEndReason) {
    // Normal events
    GroupCallEndReason[GroupCallEndReason["DeviceExplicitlyDisconnected"] = 0] = "DeviceExplicitlyDisconnected";
    GroupCallEndReason[GroupCallEndReason["ServerExplicitlyDisconnected"] = 1] = "ServerExplicitlyDisconnected";
    // Things that can go wrong
    GroupCallEndReason[GroupCallEndReason["SfuClientFailedToJoin"] = 2] = "SfuClientFailedToJoin";
    GroupCallEndReason[GroupCallEndReason["FailedToCreatePeerConnectionFactory"] = 3] = "FailedToCreatePeerConnectionFactory";
    GroupCallEndReason[GroupCallEndReason["FailedToGenerateCertificate"] = 4] = "FailedToGenerateCertificate";
    GroupCallEndReason[GroupCallEndReason["FailedToCreateOutgoingAudioTrack"] = 5] = "FailedToCreateOutgoingAudioTrack";
    GroupCallEndReason[GroupCallEndReason["FailedToCreatePeerConnection"] = 6] = "FailedToCreatePeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToCreateDataChannel"] = 7] = "FailedToCreateDataChannel";
    GroupCallEndReason[GroupCallEndReason["FailedToStartPeerConnection"] = 8] = "FailedToStartPeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToUpdatePeerConnection"] = 9] = "FailedToUpdatePeerConnection";
    GroupCallEndReason[GroupCallEndReason["FailedToSetMaxSendBitrate"] = 10] = "FailedToSetMaxSendBitrate";
    GroupCallEndReason[GroupCallEndReason["IceFailedWhileConnecting"] = 11] = "IceFailedWhileConnecting";
    GroupCallEndReason[GroupCallEndReason["IceFailedAfterConnected"] = 12] = "IceFailedAfterConnected";
    GroupCallEndReason[GroupCallEndReason["ServerChangedDemuxId"] = 13] = "ServerChangedDemuxId";
})(GroupCallEndReason = exports.GroupCallEndReason || (exports.GroupCallEndReason = {}));
// HTTP request methods.
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["Get"] = 0] = "Get";
    HttpMethod[HttpMethod["Put"] = 1] = "Put";
    HttpMethod[HttpMethod["Post"] = 2] = "Post";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
// The local device state for a group call.
class LocalDeviceState {
    constructor() {
        this.connectionState = ConnectionState.NotConnected;
        this.joinState = JoinState.NotJoined;
        // By default audio and video are muted.
        this.audioMuted = true;
        this.videoMuted = true;
    }
}
exports.LocalDeviceState = LocalDeviceState;
// All remote devices in a group call and their associated state.
class RemoteDeviceState {
    constructor(demuxId, userId) {
        this.demuxId = demuxId;
        this.userId = userId;
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
class RenderedResolution {
    constructor(demuxId, width, height, framerate) {
        this.demuxId = demuxId;
        this.width = width;
        this.height = height;
        this.framerate = framerate;
    }
}
exports.RenderedResolution = RenderedResolution;
class GroupCall {
    // Called by UI via RingRTC object
    constructor(callManager, groupId, observer) {
        this._callManager = callManager;
        this._observer = observer;
        this._localDeviceState = new LocalDeviceState();
        this._clientId = this._callManager.createGroupCallClient(groupId);
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
    getJoinedGroupMembers() {
        return this._joinedGroupMembers;
    }
    // Called by UI
    setOutgoingAudioMuted(muted) {
        this._localDeviceState.audioMuted = muted;
        this._callManager.setOutgoingAudioMuted(this._clientId, muted);
    }
    // Called by UI
    setOutgoingVideoMuted(muted) {
        this._localDeviceState.videoMuted = muted;
        this._callManager.setOutgoingVideoMuted(this._clientId, muted);
    }
    // Called by UI
    setBandwidthMode(bandwidthMode) {
        this._callManager.setBandwidthMode(this._clientId, bandwidthMode);
    }
    // Called by UI
    setRenderedResolutions(resolutions) {
        this._callManager.setRenderedResolutions(this._clientId, resolutions);
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
    handleRemoteDevicesChanged(remoteDeviceStates) {
        this._remoteDeviceStates = remoteDeviceStates;
        this._observer.onRemoteDeviceStatesChanged(this);
    }
    // Called by Rust via RingRTC object
    handleJoinedMembersChanged(members) {
        this._joinedGroupMembers = members;
        this._observer.onJoinedMembersChanged(this);
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
        return new GroupCallVideoFrameSource(this._callManager, this._clientId, remoteDemuxId);
    }
}
exports.GroupCall = GroupCall;
// Implements VideoSource for use in CanvasVideoRenderer
class GroupCallVideoFrameSource {
    constructor(callManager, clientId, remoteDemuxId) {
        this._callManager = callManager;
        this._clientId = clientId;
        this._remoteDemuxId = remoteDemuxId;
    }
    receiveVideoFrame(buffer) {
        return this._callManager.receiveGroupCallVideoFrame(this._clientId, this._remoteDemuxId, buffer);
    }
}
function to_array_buffer(pbab) {
    if (!pbab) {
        return pbab;
    }
    if (pbab instanceof ArrayBuffer) {
        return pbab;
    }
    return pbab.toArrayBuffer();
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
