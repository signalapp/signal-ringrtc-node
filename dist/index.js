"use strict";
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
const os = require('os');
const RingRTC = require('../build/' + os.platform() + '/libringrtc.node');
class CallingService {
    constructor() {
        // Set by UX
        this.handleIncomingCall = null;
        console.log("Calling: constructor");
        this.callManager = (new RingRTC.CallManager());
        this.pollEvery(50);
    }
    pollEvery(intervalMs) {
        this.callManager.poll(this);
        setTimeout(() => { this.pollEvery(intervalMs); }, intervalMs);
    }
    // Called by UX
    startOutgoingCall(remoteUserId, isVideoCall, settings) {
        console.log(`Calling: startOutgoingCall(${remoteUserId}, ${isVideoCall})`);
        const callId = null;
        const incoming = false;
        this.call = new Call(this.callManager, remoteUserId, callId, incoming, settings, CallState.Init);
        this.callManager.call(remoteUserId, isVideoCall);
        return this.call;
    }
    // Called by Rust
    onStartOutgoingCall(remoteUserId, callId) {
        console.log(`Calling: onStartOutgoingCall(${remoteUserId})`);
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call || call.remoteUserId != remoteUserId || !call.settings) {
            console.log(`Called: Ignored outgoing call from RingRTC (remoteUserId: ${remoteUserId})`);
            return;
        }
        call.callId = callId;
        this.proceed(callId, call.settings);
    }
    // Called by Rust
    onStartIncomingCall(remoteUserId, callId) {
        console.log(`Calling: onStartIncomingCall(${remoteUserId})`);
        const incoming = true;
        const call = new Call(this.callManager, remoteUserId, callId, incoming, null, CallState.Init);
        // Callback to UX not set
        const handleIncomingCall = this.handleIncomingCall;
        if (!handleIncomingCall) {
            console.log("Calling: dropping incoming call because we don't have a callback.");
            call.hangup();
            return;
        }
        this.call = call;
        (() => __awaiter(this, void 0, void 0, function* () {
            console.log("Calling: attempt handleIncomingCall");
            const settings = yield handleIncomingCall(call);
            if (!settings) {
                console.log("Calling: dropping incoming call.");
                return;
            }
            call.settings = settings;
            this.proceed(callId, settings);
        }))();
    }
    proceed(callId, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const enableForking = true;
            (() => __awaiter(this, void 0, void 0, function* () {
                // This is a silly way of causing a deadlock.
                yield 0;
                this.callManager.proceed(callId, settings.localDeviceId, settings.iceServer.username || "", settings.iceServer.password || "", settings.iceServer.urls, settings.hideIp, enableForking);
            }))();
        });
    }
    // Called by Rust
    onCallState(remoteUserId, state) {
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call || call.remoteUserId != remoteUserId) {
            console.log(`Called: Ignored call state change from RingRTC (remoteUserId: ${remoteUserId})`);
            return;
        }
        call.state = state;
        // Because you might have been enabled before you were connected.
        // TODO: Do this in native code instead.
        if (call.state == CallState.Connected) {
            // Silly hack to avoid deadlock.
            (() => __awaiter(this, void 0, void 0, function* () {
                yield 0;
                this.callManager.sendVideoStatus(call.outgoingVideoEnabled);
            }))();
        }
    }
    // Called by Rust
    onCallEnded(remoteUserId, reason) {
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call || call.remoteUserId != remoteUserId) {
            console.log(`Called: Ignored call state ended from RingRTC (remoteUserId: ${remoteUserId})`);
            return;
        }
        // Send the end reason first because setting the state triggers
        // call.handleStateChanged, which may look at call.endedReason.
        call.endedReason = reason;
        call.state = CallState.Ended;
    }
    onRemoteVideoEnabled(remoteUserId, enabled) {
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call || call.remoteUserId != remoteUserId) {
            console.log(`Called: Ignored call state ended from RingRTC (remoteUserId: ${remoteUserId})`);
            return;
        }
        if (call.handleRemoteVideoEnabled) {
            call.handleRemoteVideoEnabled(enabled);
        }
    }
    renderVideoFrame(width, height, buffer) {
        var _a, _b;
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call) {
            console.log(`Called: Ignored video frame from RingRTC.`);
            return;
        }
        if (!!((_a = this.call) === null || _a === void 0 ? void 0 : _a.renderVideoFrame)) {
            (_b = this.call) === null || _b === void 0 ? void 0 : _b.renderVideoFrame(width, height, buffer);
        }
    }
    // Called by Rust
    onSendOffer(remoteUserId, remoteDeviceId, callId, broadcast, offerType, sdp) {
        const message = new CallingMessage();
        message.offer = new OfferMessage();
        message.offer.callId = callId;
        message.offer.type = offerType;
        message.offer.sdp = sdp;
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onSendAnswer(remoteUserId, remoteDeviceId, callId, broadcast, sdp) {
        const message = new CallingMessage();
        message.answer = new AnswerMessage();
        message.answer.callId = callId;
        message.answer.sdp = sdp;
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onSendIceCandidates(remoteUserId, remoteDeviceId, callId, broadcast, candidates) {
        console.log(`onSendIceCandidates(${remoteUserId}, ${remoteDeviceId}, ${candidates})`);
        const message = new CallingMessage();
        message.iceCandidates = [];
        for (let candidate of candidates) {
            let copy = new IceCandidateMessage();
            copy.callId = callId;
            copy.mid = candidate.mid;
            copy.midIndex = 0;
            copy.sdp = candidate.sdp;
            message.iceCandidates.push(copy);
        }
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onSendLegacyHangup(remoteUserId, remoteDeviceId, callId, broadcast, hangupType, deviceId) {
        const message = new CallingMessage();
        message.legacyHangup = new HangupMessage();
        message.legacyHangup.callId = callId;
        message.legacyHangup.type = hangupType;
        message.legacyHangup.deviceId = deviceId || 0;
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onSendHangup(remoteUserId, remoteDeviceId, callId, broadcast, hangupType, deviceId) {
        const message = new CallingMessage();
        message.hangup = new HangupMessage();
        message.hangup.callId = callId;
        message.hangup.type = hangupType;
        message.hangup.deviceId = deviceId || 0;
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onSendBusy(remoteUserId, remoteDeviceId, callId, broadcast) {
        const message = new CallingMessage();
        message.busy = new BusyMessage();
        message.busy.callId = callId;
        this.sendSignaling(remoteUserId, remoteDeviceId, broadcast, message);
    }
    // Called by Rust
    onLog(message) {
        console.log(`Calling: From RingRTC: '${message}'`);
    }
    sendSignaling(remoteUserId, remoteDeviceId, broadcast, message) {
        console.log(`Calling: SendSignaling(remoteUserId: ${remoteUserId}, remoteDeviceId: ${remoteDeviceId}, broadcast: ${broadcast}, message: ${message})`);
        // TODO: Support more than one call at a time.
        const call = this.call;
        if (!call || call.remoteUserId != remoteUserId) {
            console.log(`Called: Ignored sending signaling for unknown call (remoteUserId: ${remoteUserId})`);
            return;
        }
        message.supportsMultiRing = true;
        if (!broadcast) {
            message.destinationDeviceId = remoteDeviceId;
        }
        if (!call.sendSignaling) {
            console.log(`Called: Ignored sending signaling because we don't have a callback for it.`);
            return;
        }
        call.sendSignaling(message);
    }
    // Called by MessageReceiver
    handleMessage(remoteUserId, remoteDeviceId, message) {
        console.log(`Calling: handleMessage(${remoteUserId}, ${remoteDeviceId} (${typeof remoteDeviceId}), ${message})`);
        const remoteSupportsMultiRing = message.supportsMultiRing || false;
        if (message.offer && message.offer.callId && message.offer.sdp) {
            const callId = message.offer.callId;
            const sdp = message.offer.sdp;
            const offerType = message.offer.type || OfferType.AudioCall;
            // TODO: Do something different when the offerType is NeedsPermission.
            console.log(`Calling: receivedOffer(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, callId.low]}, ${offerType}, ${remoteSupportsMultiRing}, ${sdp})`);
            this.callManager.receivedOffer(remoteUserId, remoteDeviceId, callId, offerType, remoteSupportsMultiRing, sdp);
        }
        if (message.answer && message.answer.callId && message.answer.sdp) {
            const callId = message.answer.callId;
            const sdp = message.answer.sdp;
            console.log(`Calling: receivedAnswer(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, callId.low]}, ${remoteSupportsMultiRing}, ${sdp})`);
            this.callManager.receivedAnswer(remoteUserId, remoteDeviceId, callId, remoteSupportsMultiRing, sdp);
        }
        if (message.iceCandidates && message.iceCandidates.length > 0) {
            let callId = null;
            let candidateSdps = [];
            for (let candidate of message.iceCandidates) {
                // TODO: Handle if they differ in .callId.
                callId = candidate.callId;
                if (!!candidate.sdp) {
                    candidateSdps.push(candidate.sdp);
                }
            }
            console.log(`Calling: receivedIceCandidates(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, typeof callId.low]}, ${candidateSdps})`);
            this.callManager.receivedIceCandidates(remoteUserId, remoteDeviceId, callId, candidateSdps);
        }
        if (message.hangup && message.hangup.callId) {
            const callId = message.hangup.callId;
            const hangupType = message.hangup.type || HangupType.Normal;
            const hangupDeviceId = message.hangup.deviceId || null;
            console.log(`Calling: receivedHangup(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, callId.low]}, ${hangupType}, ${hangupDeviceId})`);
            this.callManager.receivedHangup(remoteUserId, remoteDeviceId, callId, hangupType, hangupDeviceId);
        }
        if (message.legacyHangup && message.legacyHangup.callId) {
            const callId = message.legacyHangup.callId;
            const hangupType = message.legacyHangup.type || HangupType.Normal;
            const hangupDeviceId = message.legacyHangup.deviceId || null;
            console.log(`Calling: (legacy) receivedHangup(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, callId.low]}, ${hangupType}, ${hangupDeviceId})`);
            this.callManager.receivedHangup(remoteUserId, remoteDeviceId, callId, hangupType, hangupDeviceId);
        }
        if (message.busy && message.busy.callId) {
            const callId = message.busy.callId;
            console.log(`Calling: receivedBusy(${remoteUserId}, ${remoteDeviceId}, ${[callId.high, callId.low]})`);
            this.callManager.receivedBusy(remoteUserId, remoteDeviceId, callId);
        }
    }
}
exports.CallingService = CallingService;
const Service = new CallingService();
exports.default = Service;
class Call {
    constructor(callManager, remoteUserId, callId, incoming, settings, state) {
        this._outgoingVideoEnabled = false;
        this._callManager = callManager;
        this._remoteUserId = remoteUserId;
        this.callId = callId;
        this._incoming = incoming;
        this.settings = settings;
        this._state = state;
    }
    get remoteUserId() {
        return this._remoteUserId;
    }
    get incoming() {
        return this._incoming;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        if (!!this.handleStateChanged) {
            this.handleStateChanged();
        }
    }
    accept() {
        console.log(`Calling: accept()`);
        this._callManager.accept(this.callId);
    }
    hangup() {
        // This assumes we only have one active all.
        // TODO: Change this so it passes in a CallId.
        console.log(`Calling: hangup()`);
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of causing a deadlock.
            yield 0;
            this._callManager.hangup();
        }))();
    }
    set outgoingAudioEnabled(enabled) {
        console.log(`Calling: setOutgoingAudioEnabled(${enabled})`);
        // This assumes we only have one active all.
        // TODO: Change this so it passes in a CallId.
        (() => __awaiter(this, void 0, void 0, function* () {
            // This is a silly way of not causing a deadlock.
            yield 0;
            this._callManager.setOutgoingAudioEnabled(enabled);
        }))();
    }
    get outgoingVideoEnabled() {
        return this._outgoingVideoEnabled;
    }
    set outgoingVideoEnabled(enabled) {
        console.log(`Calling: setOutgoingVideoEnabled(${enabled})`);
        this._outgoingVideoEnabled = enabled;
        if (this.state == CallState.Connected) {
            // This assumes we only have one active all.
            // TODO: Change this so it passes in a CallId.
            this._callManager.sendVideoStatus(enabled);
        }
    }
    sendVideoFrame(width, height, rgbaBuffer) {
        // This assumes we only have one active all.
        // TODO: Change this so it passes in a CallId.
        // console.log(`Calling: sendVideoFrame(${width}, ${height})`);
        this._callManager.sendVideoFrame(width, height, rgbaBuffer);
    }
}
exports.Call = Call;
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
    OfferType[OfferType["NeedsPermission"] = 2] = "NeedsPermission";
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
})(HangupType = exports.HangupType || (exports.HangupType = {}));
var CallState;
(function (CallState) {
    CallState["Init"] = "init";
    CallState["Ringing"] = "ringing";
    CallState["Connected"] = "connected";
    CallState["Connecting"] = "connecting";
    CallState["Ended"] = "concluded";
})(CallState = exports.CallState || (exports.CallState = {}));
