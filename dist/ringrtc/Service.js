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
        this.callManager = new Native.CallManager();
        this._call = null;
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
        if (!call || call.remoteUserId !== remoteUserId) {
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
    // Called by Rust
    onLogMessage(level, fileName, line, message) {
        if (this.handleLogMessage) {
            this.handleLogMessage(level, fileName, line, message);
        }
    }
    // Called by MessageReceiver
    // tslint:disable-next-line cyclomatic-complexity
    handleCallingMessage(remoteUserId, remoteDeviceId, localDeviceId, messageAgeSec, message) {
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
            this.callManager.receivedOffer(remoteUserId, remoteDeviceId, localDeviceId, messageAgeSec, callId, offerType, remoteSupportsMultiRing, opaque, sdp);
        }
        if (message.answer && message.answer.callId) {
            const callId = message.answer.callId;
            const opaque = to_array_buffer(message.answer.opaque);
            const sdp = message.answer.sdp;
            this.callManager.receivedAnswer(remoteUserId, remoteDeviceId, callId, remoteSupportsMultiRing, opaque, sdp);
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
    sendVideoFrame(width, height, rgbaBuffer) {
        // This assumes we only have one active all.
        this._callManager.sendVideoFrame(width, height, rgbaBuffer);
    }
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
