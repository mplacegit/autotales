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
		
}
var VideoPlayer = function VideoPlayer() {
        this.playedCnt=0;
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
		case "firstQuartile":
		self.playedCnt++;
		break;
		case "MyVastEnded":
		if(!self.playedCnt){
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_ERROR, "не было проиграно ничего");
		}else{
		console.log(["пришло окончательное событие",data.eventName]); 
		self.stop();
		}
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
		iframe.scrolling="no";
		istyle.innerHTML = ' video{display:none !important} ';
		iframe.src='//mp.klemix.ru/?index='+this.index+'&affiliate_id='+this.parent.context.parameters.affiliate_id+'&pid='+this.parent.context.parameters.pid+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height;
		
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
function IFRAMEInterface() {
        this.subscribers = {};
        this.parameters = {
            version: "2.0"
        };
        this.flags = {};
};
IFRAMEInterface.prototype.handshakeVersion = function handshakeVersion() {
        return this.parameters.version;
};
IFRAMEInterface.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {

console.log(["началось"]);
        if(this.flags.inited) {
            return;
        }
        this.flags.inited = true;
		var data = JSON.parse(creativeData.AdParameters || "{}"); 
		console.log([2301,data]);
	
		
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
		
		 this.parameters.size = {
            width: width,
            height: height
        };
		this.parameters.pid = pid;
        this.parameters.affiliate_id = affiliate_id;  
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
	IFRAMEInterface.prototype.startAd = function () {
        if(!this.flags.started) {
            this.flags.started = true;
			//console.log(['медиаплеер']);
			this.mediaPlayer.play();
			//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdStarted, {}));
			
            //this.parameters.slot.innerHTML='<span style="color:#FFFFFF">это всё афёры. не верьте граждане</span>';
        }
    };
    IFRAMEInterface.prototype.stopAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
			
          // this.mediaPlayer.stop();
        }
    };
    IFRAMEInterface.prototype.skipAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
           // this.mediaPlayer.stop();
        }
    };
    IFRAMEInterface.prototype.resizeAd = function (width, height) {
        if(this.flags.stopped || !this.flags.inited) {
            return;
        }
        this.parameters.slot.style.width = width + "px";
        this.parameters.slot.style.height = height + "px";
    };
    IFRAMEInterface.prototype.pauseAd = function () {
        if(!this.flags.stopped && this.flags.started) {
           // this.mediaPlayer.pause();
        }
    };
    IFRAMEInterface.prototype.resumeAd = function () {
        if(!this.flags.stopped && this.flags.started) {
           // this.mediaPlayer.resume();
        }
    };
    IFRAMEInterface.prototype.expandAd = function () {
        console.log("AdLog", "The method \"expandAd\" is not implemented");
    };
    IFRAMEInterface.prototype.collapseAd = function () {
        console.log("AdLog", "The method \"collapseAd\" is not implemented");
    };
    IFRAMEInterface.prototype.setAdVolume = function (value) {
        if(!this.flags.stopped && this.flags.started) {
		//console.log("валюе");
           // this.mediaPlayer.setVolume(value > 1 ? value / 100 : value);
        }
    };
    IFRAMEInterface.prototype.getAdVolume = function () {
        //return this.mediaPlayer.getMetaData().volume;
    };
    IFRAMEInterface.prototype.getAdDuration = function () {
       // return this.mediaPlayer.getMetaData().duration;
    };
    IFRAMEInterface.prototype.getAdLinear = function () {
        return true;
    };
    IFRAMEInterface.prototype.getAdWidth = function () {
        return this.parameters.width; //TODO this.parameters.size.width?
    };
    IFRAMEInterface.prototype.getAdHeight = function () {
        return this.parameters.height;
    };
    IFRAMEInterface.prototype.getAdRemainingTime = function () {
        var meta = this.mediaPlayer.getMetaData();
        return meta.duration - meta.currentTime;
    };
    IFRAMEInterface.prototype.getAdExpanded = function () {
        return false;
    };
    IFRAMEInterface.prototype.getAdSkippableState = function () {
        return this.parameters.skippableState;
    };
    IFRAMEInterface.prototype.getAdIcons = function () {
        return this.parameters.icons;
    };
    IFRAMEInterface.prototype.getAdCompanions = function () {
        return this.parameters.companions;
    };
    IFRAMEInterface.prototype.subscribe = function (handler, events, context) {
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
    IFRAMEInterface.prototype.unsubscribe = function (handler, events) {
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
module.exports = IFRAMEInterface;