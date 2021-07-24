"use strict";
//
// Copyright 2019-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.RingRTC = exports.MAX_VIDEO_CAPTURE_WIDTH = exports.MAX_VIDEO_CAPTURE_HEIGHT = exports.MAX_VIDEO_CAPTURE_BUFFER_SIZE = exports.MAX_VIDEO_CAPTURE_AREA = exports.GumVideoCapturer = exports.CanvasVideoRenderer = exports.VideoRequest = exports.RingRTCType = exports.RemoteDeviceState = exports.PeekInfo = exports.OpaqueMessage = exports.OfferType = exports.LocalDeviceState = exports.JoinState = exports.HttpMethod = exports.HangupType = exports.HangupMessage = exports.GroupMemberInfo = exports.GroupCallEndReason = exports.GroupCall = exports.ConnectionState = exports.CallingMessage = exports.CallState = exports.CallLogLevel = exports.CallEndedReason = exports.Call = exports.BandwidthMode = void 0;
var Service_1 = require("./ringrtc/Service");
Object.defineProperty(exports, "BandwidthMode", { enumerable: true, get: function () { return Service_1.BandwidthMode; } });
Object.defineProperty(exports, "Call", { enumerable: true, get: function () { return Service_1.Call; } });
Object.defineProperty(exports, "CallEndedReason", { enumerable: true, get: function () { return Service_1.CallEndedReason; } });
Object.defineProperty(exports, "CallLogLevel", { enumerable: true, get: function () { return Service_1.CallLogLevel; } });
Object.defineProperty(exports, "CallState", { enumerable: true, get: function () { return Service_1.CallState; } });
Object.defineProperty(exports, "CallingMessage", { enumerable: true, get: function () { return Service_1.CallingMessage; } });
Object.defineProperty(exports, "ConnectionState", { enumerable: true, get: function () { return Service_1.ConnectionState; } });
Object.defineProperty(exports, "GroupCall", { enumerable: true, get: function () { return Service_1.GroupCall; } });
Object.defineProperty(exports, "GroupCallEndReason", { enumerable: true, get: function () { return Service_1.GroupCallEndReason; } });
Object.defineProperty(exports, "GroupMemberInfo", { enumerable: true, get: function () { return Service_1.GroupMemberInfo; } });
Object.defineProperty(exports, "HangupMessage", { enumerable: true, get: function () { return Service_1.HangupMessage; } });
Object.defineProperty(exports, "HangupType", { enumerable: true, get: function () { return Service_1.HangupType; } });
Object.defineProperty(exports, "HttpMethod", { enumerable: true, get: function () { return Service_1.HttpMethod; } });
Object.defineProperty(exports, "JoinState", { enumerable: true, get: function () { return Service_1.JoinState; } });
Object.defineProperty(exports, "LocalDeviceState", { enumerable: true, get: function () { return Service_1.LocalDeviceState; } });
Object.defineProperty(exports, "OfferType", { enumerable: true, get: function () { return Service_1.OfferType; } });
Object.defineProperty(exports, "OpaqueMessage", { enumerable: true, get: function () { return Service_1.OpaqueMessage; } });
Object.defineProperty(exports, "PeekInfo", { enumerable: true, get: function () { return Service_1.PeekInfo; } });
Object.defineProperty(exports, "RemoteDeviceState", { enumerable: true, get: function () { return Service_1.RemoteDeviceState; } });
Object.defineProperty(exports, "RingRTCType", { enumerable: true, get: function () { return Service_1.RingRTCType; } });
Object.defineProperty(exports, "VideoRequest", { enumerable: true, get: function () { return Service_1.VideoRequest; } });
var VideoSupport_1 = require("./ringrtc/VideoSupport");
Object.defineProperty(exports, "CanvasVideoRenderer", { enumerable: true, get: function () { return VideoSupport_1.CanvasVideoRenderer; } });
Object.defineProperty(exports, "GumVideoCapturer", { enumerable: true, get: function () { return VideoSupport_1.GumVideoCapturer; } });
Object.defineProperty(exports, "MAX_VIDEO_CAPTURE_AREA", { enumerable: true, get: function () { return VideoSupport_1.MAX_VIDEO_CAPTURE_AREA; } });
Object.defineProperty(exports, "MAX_VIDEO_CAPTURE_BUFFER_SIZE", { enumerable: true, get: function () { return VideoSupport_1.MAX_VIDEO_CAPTURE_BUFFER_SIZE; } });
Object.defineProperty(exports, "MAX_VIDEO_CAPTURE_HEIGHT", { enumerable: true, get: function () { return VideoSupport_1.MAX_VIDEO_CAPTURE_HEIGHT; } });
Object.defineProperty(exports, "MAX_VIDEO_CAPTURE_WIDTH", { enumerable: true, get: function () { return VideoSupport_1.MAX_VIDEO_CAPTURE_WIDTH; } });
const Service_2 = require("./ringrtc/Service");
exports.RingRTC = new Service_2.RingRTCType();
