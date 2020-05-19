"use strict";
//
// Copyright (C) 2020 Signal Messenger, LLC.
// All rights reserved.
//
// SPDX-License-Identifier: GPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
var Service_1 = require("./ringrtc/Service");
exports.RingRTCType = Service_1.default;
exports.Call = Service_1.Call;
exports.CallState = Service_1.CallState;
exports.CallingMessage = Service_1.CallingMessage;
var VideoSupport_1 = require("./ringrtc/VideoSupport");
exports.CanvasVideoRenderer = VideoSupport_1.CanvasVideoRenderer;
exports.GumVideoCapturer = VideoSupport_1.GumVideoCapturer;
const Service_2 = require("./ringrtc/Service");
exports.RingRTC = new Service_2.default();
