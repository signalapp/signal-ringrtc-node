"use strict";
//
// Copyright (C) 2020 Signal Messenger, LLC.
// All rights reserved.
//
// SPDX-License-Identifier: GPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
var Service_1 = require("./ringrtc/Service");
exports.BandwidthMode = Service_1.BandwidthMode;
exports.Call = Service_1.Call;
exports.CallEndedReason = Service_1.CallEndedReason;
exports.CallLogLevel = Service_1.CallLogLevel;
exports.CallState = Service_1.CallState;
exports.CallingMessage = Service_1.CallingMessage;
exports.ConnectionState = Service_1.ConnectionState;
exports.GroupCall = Service_1.GroupCall;
exports.GroupCallEndReason = Service_1.GroupCallEndReason;
exports.GroupMemberInfo = Service_1.GroupMemberInfo;
exports.HangupMessage = Service_1.HangupMessage;
exports.HangupType = Service_1.HangupType;
exports.HttpMethod = Service_1.HttpMethod;
exports.JoinState = Service_1.JoinState;
exports.LocalDeviceState = Service_1.LocalDeviceState;
exports.OfferType = Service_1.OfferType;
exports.OpaqueMessage = Service_1.OpaqueMessage;
exports.RemoteDeviceState = Service_1.RemoteDeviceState;
exports.RenderedResolution = Service_1.RenderedResolution;
exports.RingRTCType = Service_1.RingRTCType;
var VideoSupport_1 = require("./ringrtc/VideoSupport");
exports.CanvasVideoRenderer = VideoSupport_1.CanvasVideoRenderer;
exports.GumVideoCapturer = VideoSupport_1.GumVideoCapturer;
const Service_2 = require("./ringrtc/Service");
exports.RingRTC = new Service_2.RingRTCType();
