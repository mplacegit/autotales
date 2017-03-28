(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
function VPAIDEvent(type, data){
        this.type = type;
        this.data = data;
}
	VPAIDEvent.convertToVAST = function(name) {
        return {
                AdLoaded:               VideoEvent.AD_READY,
                AdVolumeChange:         VideoEvent.AD_VOLUME_CHANGE,
                AdError:                VideoEvent.AD_ERROR,
                AdStarted:              VideoEvent.AD_START,
                AdImpression:           VideoEvent.AD_IMPRESSION,
                AdStopped:              VideoEvent.AD_STOP,
                AdPaused:               VideoEvent.AD_PAUSE,
                AdPlaying:              VideoEvent.AD_RESUME,
                AdVideoStart:           VideoEvent.VIDEO_START,
                AdVideoFirstQuartile:   VideoEvent.VIDEO_FIRST_QUARTILE,
                AdVideoMidpoint:        VideoEvent.VIDEO_MIDPOINT,
                AdVideoThirdQuartile:   VideoEvent.VIDEO_THIRD_QUARTILE,
                AdVideoComplete:        VideoEvent.VIDEO_COMPLETE,
                AdUserClose:            VideoEvent.USER_CLOSE,
                AdSkipped:              VideoEvent.USER_SKIP,
                AdUserAcceptInvitation: VideoEvent.USER_ACCEPT_INVENTATION,
                AdInteraction:          VideoEvent.USER_INTERACTION,
                AdClickThru:            VideoEvent.USER_CLICK
            }[name] || "";
    };
	VPAIDEvent.convertFromVAST = function(name) {
        return {
                ready:                  VPAIDEvent.AdLoaded,
                volumeChange:           VPAIDEvent.AdVolumeChange,
                error:                  VPAIDEvent.AdError,
                creativeView:           VPAIDEvent.AdStarted,
                impression:             VPAIDEvent.AdImpression,
                stop:                   VPAIDEvent.AdStopped,
                pause:                  VPAIDEvent.AdPaused,
                resume:                 VPAIDEvent.AdPlaying,
                start:                  VPAIDEvent.AdVideoStart,
                firstQuartile:          VPAIDEvent.AdVideoFirstQuartile,
                midpoint:               VPAIDEvent.AdVideoMidpoint,
                thirdQuartile:          VPAIDEvent.AdVideoThirdQuartile,
                complete:               VPAIDEvent.AdVideoComplete,
                closeLinear:            VPAIDEvent.AdUserClose,
                skip:                   VPAIDEvent.AdSkipped,
                acceptInvitation:       VPAIDEvent.AdUserAcceptInvitation,
                interaction:            VPAIDEvent.AdInteraction,
                click:                  VPAIDEvent.AdClickThru
            }[name] || "";
    };
    VPAIDEvent.AdLoaded = "AdLoaded";
    VPAIDEvent.AdStarted = "AdStarted";
    VPAIDEvent.AdStopped = "AdStopped";
    VPAIDEvent.AdSkipped = "AdSkipped";
    VPAIDEvent.AdLinearChange = "AdLinearChange";
    VPAIDEvent.AdSizeChange = "AdSizeChange";
    VPAIDEvent.AdExpandedChange = "AdExpandedChange";
    VPAIDEvent.AdSkippableStateChange = "AdSkippableStateChange";
    VPAIDEvent.AdRemainingTimeChange = "AdRemainingTimeChange";
    VPAIDEvent.AdDurationChange = "AdDurationChange";
    VPAIDEvent.AdVolumeChange = "AdVolumeChange";
    VPAIDEvent.AdImpression = "AdImpression";
    VPAIDEvent.AdVideoStart = "AdVideoStart";
    VPAIDEvent.AdVideoFirstQuartile = "AdVideoFirstQuartile";
    VPAIDEvent.AdVideoMidpoint = "AdVideoMidpoint";
    VPAIDEvent.AdVideoThirdQuartile = "AdVideoThirdQuartile";
    VPAIDEvent.AdVideoComplete = "AdVideoComplete";
    VPAIDEvent.AdClickThru = "AdClickThru";
    VPAIDEvent.AdInteraction = "AdInteraction";
    VPAIDEvent.AdUserAcceptInvitation = "AdUserAcceptInvitation";
    VPAIDEvent.AdUserMinimize = "AdUserMinimize";
    VPAIDEvent.AdUserClose = "AdUserClose";
    VPAIDEvent.AdPaused = "AdPaused";
    VPAIDEvent.AdPlaying = "AdPlaying";
    VPAIDEvent.AdLog = "AdLog";
    VPAIDEvent.AdError = "AdError";
module.exports = VPAIDEvent;
},{}],2:[function(require,module,exports){
'use strict';
var VPAIDEvent = require('./VPAIDEvent');
var VideoEvent = require('./VideoEvent');

var BridgeLib = require('./iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
function $notifyObservers(event) {
        (this.subscribers[event.type] || []).forEach(function (item) {
		       item.fn.call(item.ctx, event.data);
        });
}
function $mediaEventHandler(event) {
        //console.log(['все события',event]); 
        event.data = event.data || {};
        var params = {};
        if(event.type == VideoEvent.AD_ERROR) {
        params.ERRORCODE = event.data.code;
        }
		 //event.data.loadedEvent = loadEvents(this.xmlLoader, event.type, params); 
		
        if(event.type !== VideoEvent.AD_STOP) {
		    $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(event.type), event.data));
        }
		else{
		
		
		this.parameters.slot.parentNode.removeChild(this.parameters.slot);
		    $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(event.type), null));
		}
		/*
       
        else {
            this.parameters.adParameters.url = getNextBlockUrl.call(this.parameters.adParameters);

            this.flags.started = false;
            this.flags.stopped = false;

            this.xmlLoader = new XMLLoader();
            this.xmlLoader.load(this.parameters.adParameters.url, function (err, result) {
                if (err) {
                    setTimeout(function(){
                        $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(event.type), event.data));
                        this.parameters.slot.parentNode.removeChild(this.parameters.slot);
                    }.bind(this), 1300);
                    return;
                }

                var MediaPlayer;
                if (result.type == "VideoPlayer") {
                    MediaPlayer = VideoPlayer;
                }
                else {
                    MediaPlayer = result.type == "VPAIDPlayer" ? VPAIDPlayer : "Unknown";
                }

                if (typeof MediaPlayer != "function") {
                    loadEvents(this.xmlLoader, "error", {ERRORCODE: 403});
                    return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Unknown mediaType \"" + result.type + "\""));
                }

                this.mediaPlayer = new MediaPlayer(this.parameters.slot);
                this.mediaPlayer.init({
                    mediapath: this.parameters.adParameters["mediapath"],
                    xmlLoader: this.xmlLoader
                }, $mediaEventHandler, this);
            }.bind(this));
        }
		*/
}
var VideoPlayer = function VideoPlayer() {
        // this.root = root.appendChild(bo[ma]("div"));
         //this.root.id = "wb-video-player";
        //  this.root.className = "waiting";
        this.flags = {
            canSendEvent: true,
            middleEvent: [false, false, false, false, false]
        };
		var self = this;
		this.bridge=new Bridge(); 
		this.index=this.bridge.index;
		this.bridge.addAction("adEvent",function(data){
		if(data.hasOwnProperty("eventName")){
		switch (data.eventName){
		case "MyVastEnded":
		console.log(["пришло окончательное событие",data.eventName]); 
		self.stop();
		break;
        case "mute":
		//console.log(["пришло событие","volumeChange",0]); 
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_MUTE, self.getMetaData());
	    break;
		case "complete":
		break;
		case "error":
		
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_ERROR, data);
		break;
		default:
		//console.log(["пришло событие  775544 ",data.eventName,data]);  
		var tl=VPAIDEvent.convertFromVAST(data.eventName);
		VideoPlayer.$dispatchEvent.call(self, data.eventName, self.getMetaData());
		//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(data.eventName),data));
		 
		break;
		}
		}
		});
		
    };
    VideoPlayer.prototype.init = function init(data, dispatcher, context) {
        if (this.flags.inited) {
            return;
        }
        this.flags.inited = true;
        this.parent = {
            dispatcher: dispatcher,
            context: context
        };
    /*
        var extensions = data.xmlLoader.getExtensions();

        this.extensions = {
            controls: extensions.controls != "0",
            skipTime: str2time(extensions.skipTime),
            closeTime: str2time(extensions.skipTime2),
            isClickable: extensions.isClickable !== "0",
            adLink: extensions.adLink || "http://weborama.com.ru",
            linkText: decodeURIComponent(extensions.linkText || "%D0%9F%D0%B5%D1%80%D0%B5%D0%B9%D1%82%D0%B8%20%D0%BD%D0%B0%20%D1%81%D0%B0%D0%B9%D1%82%20%D1%80%D0%B5%D0%BA%D0%BB%D0%B0%D0%BC%D0%BE%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8F"),
            allowBlock: extensions.Allowblock
        };
		
        if(this.extensions.controls) {
            var style = bo[ma]("link");
            style.href = data.mediapath + "wb-video-player.css";
            style.rel = "stylesheet";
            this.root.appendChild(style);
        }else
		{
			var style = bo[ma]("link");
            style.href = data.mediapath + "wb-no-controls.css";
            style.rel = "stylesheet";
            this.root.appendChild(style);
		}
    
        this.adLink = data.xmlLoader.getAdLink();
        this.mediaPlayer = this.root.appendChild(bo[ma]("video"));
		this.mediaPlayer.context = this;
        this.mediaPlayer.poster = extensions.poster || data.mediapath + "poster.png";
        this.mediaPlayer.className = "wb-area-media";
    
        //mobile only
        this.mediaPlayer.setAttribute('playsinline', '');
        this.mediaPlayer.setAttribute('webkit-playsinline', '');

        VideoPlayer.allowEvents.forEach(function (eventName) {
            this.mediaPlayer.addEventListener(eventName, VideoPlayer.videoEventHandler, true);
        }.bind(this));
    
        var mediaFiles = data.xmlLoader.getMediaFiles(),
            canplay = false;
        for (var i = 0; i < mediaFiles.length; i++) {
            if (this.mediaPlayer.canPlayType(mediaFiles[i].type)) {
                var source = bo[ma]("source");
                source.type = mediaFiles[i].type;
                source.src = mediaFiles[i].src;
                this.mediaPlayer.appendChild(source);
                canplay = true;
            }
        }
        if(!canplay) {
            this.flags.error = true;
            return VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_ERROR, {code:403, message: "Supported MediaFiles not found"});
        }
        setTimeout(function () {
            if (!this.flags.error) {
                VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_READY, this.getMetaData());
            }
        }.bind(this), 200);
		*/
    };	
	
    VideoPlayer.prototype.getMetaData = function getMetaData() {
        return {};
    };
	VideoPlayer.prototype.stop = function stop() {
	console.log("kontrolog"); 
	VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_STOP, this.getMetaData());
	//console.log("остановка ресурса !!!!");
	}
    VideoPlayer.prototype.play = function play() {
        if (this.flags.started || this.flags.stopped) {
            return;
        }
        this.flags.started = true;
		var istyle = document.createElement('style');
		var iframe = document.createElement('iframe');
		iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.style.border = 'none';
		istyle.innerHTML = ' video{display:none !important} ';
			/*		if(self.hasOwnProperty('ownWidth_') && self.hasOwnProperty('ownHeight_')){
			vpaid.ownWidth_=self.ownWidth_;
			vpaid.ownWidth_=self.ownHeight_;
			//console.log([3455,'gotov']);
			} */
	//	console.log([34446,"алгебраи",this.parent.context.parameters.size.width,this.parent.context.parameters.size.height]);
		iframe.src='http://apptoday.ru/autogit/autotales/autoplay.html?index='+this.index+'&affiliate_id=56015401b3da9&pid=26&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height;
		
		//alert(iframe.src);
		//iframe.src='http://www.apptoday.ru/videowidget/autoplay/autoplay.html?affiliate_id=56015401b3da9&pid=26';
		//this.parent.context.parameters.slot.innerHTML='';
		VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_START, this.getMetaData());
        VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_IMPRESSION, this.getMetaData());
		
		this.parent.context.parameters.slot.appendChild(istyle); 
		this.parent.context.parameters.slot.appendChild(iframe); 
        //console.log(['слот контекст',this.parent.context.parameters.slot]);
        
		//
		
		
		//$notifyObservers.call(this.parent.context, new VPAIDEvent(VPAIDEvent.AdStarted, {}));
		//this.parent.dispatcher.call(this.parent.context, new VideoEvent(type, data, this));
        //this.mediaPlayer.play();
    };	
    VideoPlayer.$dispatchEvent = function $dispatchEvent(type, data) {
	    if(this.flags.canSendEvent) {
		this.parent.dispatcher.call(this.parent.context, new VideoEvent(type, data, this));
        }
        this.flags.canSendEvent = true;
    };	
function VPAIDInterface() {
        this.subscribers = {};
        this.parameters = {
            version: "2.0"
        };
        this.flags = {};
};
VPAIDInterface.prototype.handshakeVersion = function handshakeVersion() {
        return this.parameters.version;
};
VPAIDInterface.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
        if(this.flags.inited) {
            return;
        }
        this.flags.inited = true;
		var data = JSON.parse(creativeData.AdParameters || "{}"); 
		
			
		
        if (!data.hasOwnProperty("affiliate_id")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"affiliate_id\" in AdParameters"));
        }
		var affiliate_id=data.affiliate_id;
		if (!data.hasOwnProperty("pid")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"pid\" in AdParameters"));
        }
		var pid=data.pid;
		//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdLog, "Олерт - hello "+affiliate_id+" / "+pid));
        //environmentVars.slot.innerHTML='это всё афёры. не верьте граждане';
		//console.log([2301,environmentVars.slot]);
		 this.parameters.size = {
            width: width,
            height: height
        };
        this.parameters.viewMode = viewMode;
        this.parameters.bitrate = desiredBitrate;
        this.parameters.adParameters = data;
        this.parameters.creativeData = creativeData;
		this.parameters.slot=environmentVars.slot;
		this.mediaPlayer = new VideoPlayer();
		this.mediaPlayer.init({
                mediapath: "",
                xmlLoader: ""
         }, $mediaEventHandler, this);
        //this.parameters.slot = environmentVars.slot.appendChild(bo[ma]("div"));
		//console.log([data]); 
		$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
      
		
    };
	VPAIDInterface.prototype.startAd = function () {
        if(!this.flags.started) {
            this.flags.started = true;
			//console.log(['медиаплеер']);
			this.mediaPlayer.play();
			//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdStarted, {}));
			
            //this.parameters.slot.innerHTML='<span style="color:#FFFFFF">это всё афёры. не верьте граждане</span>';
        }
    };
    VPAIDInterface.prototype.stopAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
			
          // this.mediaPlayer.stop();
        }
    };
    VPAIDInterface.prototype.skipAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
           // this.mediaPlayer.stop();
        }
    };
    VPAIDInterface.prototype.resizeAd = function (width, height) {
        if(this.flags.stopped || !this.flags.inited) {
            return;
        }
        this.parameters.slot.style.width = width + "px";
        this.parameters.slot.style.height = height + "px";
    };
    VPAIDInterface.prototype.pauseAd = function () {
        if(!this.flags.stopped && this.flags.started) {
           // this.mediaPlayer.pause();
        }
    };
    VPAIDInterface.prototype.resumeAd = function () {
        if(!this.flags.stopped && this.flags.started) {
           // this.mediaPlayer.resume();
        }
    };
    VPAIDInterface.prototype.expandAd = function () {
        console.log("AdLog", "The method \"expandAd\" is not implemented");
    };
    VPAIDInterface.prototype.collapseAd = function () {
        console.log("AdLog", "The method \"collapseAd\" is not implemented");
    };
    VPAIDInterface.prototype.setAdVolume = function (value) {
        if(!this.flags.stopped && this.flags.started) {
		//console.log("валюе");
           // this.mediaPlayer.setVolume(value > 1 ? value / 100 : value);
        }
    };
    VPAIDInterface.prototype.getAdVolume = function () {
        //return this.mediaPlayer.getMetaData().volume;
    };
    VPAIDInterface.prototype.getAdDuration = function () {
       // return this.mediaPlayer.getMetaData().duration;
    };
    VPAIDInterface.prototype.getAdLinear = function () {
        return true;
    };
    VPAIDInterface.prototype.getAdWidth = function () {
        return this.parameters.width; //TODO this.parameters.size.width?
    };
    VPAIDInterface.prototype.getAdHeight = function () {
        return this.parameters.height;
    };
    VPAIDInterface.prototype.getAdRemainingTime = function () {
        var meta = this.mediaPlayer.getMetaData();
        return meta.duration - meta.currentTime;
    };
    VPAIDInterface.prototype.getAdExpanded = function () {
        return false;
    };
    VPAIDInterface.prototype.getAdSkippableState = function () {
        return this.parameters.skippableState;
    };
    VPAIDInterface.prototype.getAdIcons = function () {
        return this.parameters.icons;
    };
    VPAIDInterface.prototype.getAdCompanions = function () {
        return this.parameters.companions;
    };
    VPAIDInterface.prototype.subscribe = function (handler, events, context) {
        if (typeof events === "string") {
            events = [events];
        }
        for (var i = 0, max = events.length; i < max; i++) {
            var event = events[i];
			
            if (!this.subscribers[event]) {
                this.subscribers[event] = [];
            }
			 // console.log(['salute - 2',event]);
            this.subscribers[event].push({fn: handler, ctx: context || null});
        }
    };
    VPAIDInterface.prototype.unsubscribe = function (handler, events) {
        if (typeof events === "string") {
            events = [events];
        }
        for (var i = events.length; i >= 0; i--) {
            var subscribers = this.subscribers[events[i]];
            if (subscribers && Array.isArray(subscribers) && subscribers.length) {
                for (var j = 0, max = subscribers.length; j < max; j++) {
                    if (subscribers[j].fn === handler) {
                        subscribers.splice(j, 1);
                    }
                }
            }
        }
    };	
module.exports = VPAIDInterface;
},{"./VPAIDEvent":1,"./VideoEvent":3,"./iFrameBridge":4}],3:[function(require,module,exports){
'use strict';
 var VideoEvent = function VideoEvent(type, data) {
        this.type = type;
        this.data = data;
    };
    VideoEvent.AD_READY = "ready";
    VideoEvent.AD_VOLUME_CHANGE = "volumeChange";
    VideoEvent.AD_ERROR = "error";
    VideoEvent.AD_STOP = "stop";
    VideoEvent.AD_START = "creativeView";
    VideoEvent.AD_IMPRESSION = "impression";
    VideoEvent.AD_MUTE = "mute";
    VideoEvent.AD_UNMUTE = "unmute";
    VideoEvent.AD_PAUSE = "pause";
    VideoEvent.AD_RESUME = "resume";
    VideoEvent.AD_REWIND = "rewind";
    VideoEvent.VIDEO_START = "start";
    VideoEvent.VIDEO_FIRST_QUARTILE = "firstQuartile";
    VideoEvent.VIDEO_MIDPOINT = "midpoint";
    VideoEvent.VIDEO_THIRD_QUARTILE = "thirdQuartile";
    VideoEvent.VIDEO_COMPLETE = "complete";
    VideoEvent.VIDEO_PROGRESS = "progress";
    VideoEvent.USER_CLOSE = "closeLinear";
    VideoEvent.USER_SKIP = "skip";
    VideoEvent.USER_ACCEPT_INVENTATION = "acceptInvitation";
    VideoEvent.USER_INTERACTION = "interaction";
    VideoEvent.USER_CLICK = "click";
module.exports = VideoEvent;	
},{}],4:[function(require,module,exports){
/**
 * Created by admin on 13.03.17.
 */
'use strict';
function makeBridge(index){
    var index=index||getUniqueIndex();
    if(typeof  window.MpFrameBridges=="undefined") {
        window.MpFrameBridges={};
    };
    if(typeof  window.MpFrameBridges[index]!="undefined") {
        return  window.MpFrameBridges[index];
    }else {
        window.MpFrameBridges[index]=new Bridge(index);
        return window.MpFrameBridges[index];
    }

}
function callAction(name,data,window) {
    // посылает сообщение для указанного window.

    // action содержит в себе имя события и данные для развертывания
	
    window.postMessage({name:name,data:data,bridgeAction:true},'*');
}
function getUniqueIndex(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
function Bridge(index){

    this.index=index||getUniqueIndex();


    var self=this;

    var actions={
        "default":function(){
            // console.log(actions,this,self)
        }
    };

    this.execAction=function(name,data){
        var action=actions[name]||actions['default']||function(){};
        action.call(this,data);
    };

    this.addAction=function(name,dispatcher){
        actions[name]=dispatcher;
    };
    this.showActions=function(){console.log(actions)};



}
window.makeBridge=makeBridge;
window.mp_bridge_listener=function(event){

    if(typeof  event.data=="object") {
        if(typeof event.data.bridgeAction!="undefined"&& (event.data.bridgeAction==true)) {
            //broadcast
            if(event.data.data.index=="broadcast"&&typeof window.MpFrameBridges!="undefined") {


                for(var i in window.MpFrameBridges)
                {
                    if(window.MpFrameBridges.hasOwnProperty(i)){
                        window.MpFrameBridges[i].execAction(event.data.name,event.data.data);
                    }
                }
            }
             //console.log(event.data.name,event.data.data.index);
            makeBridge(event.data.data.index).execAction(event.data.name,event.data.data);

        }
    }

};
if(typeof window.MpBridgeListenerAttached=="undefined"){
    if (window.addEventListener) {
        window.addEventListener("message",mp_bridge_listener);
    } else {
        // IE8
        window.attachEvent("onmessage",  mp_bridge_listener);
    }
    window.MpBridgeListenerAttached=true;
}

module.exports ={Bridge:makeBridge,callAction:callAction};
},{}],5:[function(require,module,exports){
'use strict';
var VPAIDInterface = require('./../models/VPAIDInterface');
window.getVPAIDAd = function(){
return new VPAIDInterface();
}

},{"./../models/VPAIDInterface":2}]},{},[5])