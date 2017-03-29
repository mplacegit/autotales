!function e(t,i,n){function a(d,o){if(!i[d]){if(!t[d]){var s="function"==typeof require&&require;if(!o&&s)return s(d,!0);if(r)return r(d,!0);throw new Error("Cannot find module '"+d+"'")}var p=i[d]={exports:{}};t[d][0].call(p.exports,function(e){var i=t[d][1][e];return a(i?i:e)},p,p.exports,e,t,i,n)}return i[d].exports}for(var r="function"==typeof require&&require,d=0;d<n.length;d++)a(n[d]);return a}({1:[function(e,t,i){"use strict";function n(e,t){this.type=e,this.data=t}n.convertToVAST=function(e){return{AdLoaded:VideoEvent.AD_READY,AdVolumeChange:VideoEvent.AD_VOLUME_CHANGE,AdError:VideoEvent.AD_ERROR,AdStarted:VideoEvent.AD_START,AdImpression:VideoEvent.AD_IMPRESSION,AdStopped:VideoEvent.AD_STOP,AdPaused:VideoEvent.AD_PAUSE,AdPlaying:VideoEvent.AD_RESUME,AdVideoStart:VideoEvent.VIDEO_START,AdVideoFirstQuartile:VideoEvent.VIDEO_FIRST_QUARTILE,AdVideoMidpoint:VideoEvent.VIDEO_MIDPOINT,AdVideoThirdQuartile:VideoEvent.VIDEO_THIRD_QUARTILE,AdVideoComplete:VideoEvent.VIDEO_COMPLETE,AdUserClose:VideoEvent.USER_CLOSE,AdSkipped:VideoEvent.USER_SKIP,AdUserAcceptInvitation:VideoEvent.USER_ACCEPT_INVENTATION,AdInteraction:VideoEvent.USER_INTERACTION,AdClickThru:VideoEvent.USER_CLICK}[e]||""},n.convertFromVAST=function(e){return{ready:n.AdLoaded,volumeChange:n.AdVolumeChange,error:n.AdError,creativeView:n.AdStarted,impression:n.AdImpression,stop:n.AdStopped,pause:n.AdPaused,resume:n.AdPlaying,start:n.AdVideoStart,firstQuartile:n.AdVideoFirstQuartile,midpoint:n.AdVideoMidpoint,thirdQuartile:n.AdVideoThirdQuartile,complete:n.AdVideoComplete,closeLinear:n.AdUserClose,skip:n.AdSkipped,acceptInvitation:n.AdUserAcceptInvitation,interaction:n.AdInteraction,click:n.AdClickThru}[e]||""},n.AdLoaded="AdLoaded",n.AdStarted="AdStarted",n.AdStopped="AdStopped",n.AdSkipped="AdSkipped",n.AdLinearChange="AdLinearChange",n.AdSizeChange="AdSizeChange",n.AdExpandedChange="AdExpandedChange",n.AdSkippableStateChange="AdSkippableStateChange",n.AdRemainingTimeChange="AdRemainingTimeChange",n.AdDurationChange="AdDurationChange",n.AdVolumeChange="AdVolumeChange",n.AdImpression="AdImpression",n.AdVideoStart="AdVideoStart",n.AdVideoFirstQuartile="AdVideoFirstQuartile",n.AdVideoMidpoint="AdVideoMidpoint",n.AdVideoThirdQuartile="AdVideoThirdQuartile",n.AdVideoComplete="AdVideoComplete",n.AdClickThru="AdClickThru",n.AdInteraction="AdInteraction",n.AdUserAcceptInvitation="AdUserAcceptInvitation",n.AdUserMinimize="AdUserMinimize",n.AdUserClose="AdUserClose",n.AdPaused="AdPaused",n.AdPlaying="AdPlaying",n.AdLog="AdLog",n.AdError="AdError",t.exports=n},{}],2:[function(e,t,i){"use strict";function n(e){(this.subscribers[e.type]||[]).forEach(function(t){t.fn.call(t.ctx,e.data)})}function a(e){e.data=e.data||{};var t={};e.type==o.AD_ERROR&&(t.ERRORCODE=e.data.code),e.type!==o.AD_STOP?n.call(this,new d(d.convertFromVAST(e.type),e.data)):(this.parameters.slot.parentNode.removeChild(this.parameters.slot),n.call(this,new d(d.convertFromVAST(e.type),null)))}function r(){this.subscribers={},this.parameters={version:"2.0"},this.flags={}}var d=e("./VPAIDEvent"),o=e("./VideoEvent"),s=e("./iFrameBridge");window.Bridge=s.Bridge,window.CallAction=s.callAction;var p=function e(){this.flags={canSendEvent:!0,middleEvent:[!1,!1,!1,!1,!1]};var t=this;this.bridge=new Bridge,this.index=this.bridge.index,this.bridge.addAction("adEvent",function(i){if(i.hasOwnProperty("eventName"))switch(i.eventName){case"MyVastEnded":console.log(["пришло окончательное событие",i.eventName]),t.stop();break;case"mute":e.$dispatchEvent.call(t,o.AD_MUTE,t.getMetaData());break;case"complete":break;case"error":e.$dispatchEvent.call(t,o.AD_ERROR,i);break;default:d.convertFromVAST(i.eventName);e.$dispatchEvent.call(t,i.eventName,t.getMetaData())}})};p.prototype.init=function(e,t,i){this.flags.inited||(this.flags.inited=!0,this.parent={dispatcher:t,context:i})},p.prototype.getMetaData=function(){return{}},p.prototype.stop=function(){console.log("kontrolog"),p.$dispatchEvent.call(this,o.AD_STOP,this.getMetaData())},p.prototype.play=function(){if(!this.flags.started&&!this.flags.stopped){this.flags.started=!0;var e=document.createElement("style"),t=document.createElement("iframe");t.style.width="100%",t.style.height="100%",t.style.display="block",t.style.border="none",e.innerHTML=" video{display:none !important} ",t.src="http://apptoday.ru/autogit/autotales/autoplay.html?index="+this.index+"&affiliate_id="+this.parent.context.parameters.affiliate_id+"&pid="+this.parent.context.parameters.pid+"&width="+this.parent.context.parameters.size.width+"&height="+this.parent.context.parameters.size.height,p.$dispatchEvent.call(this,o.AD_START,this.getMetaData()),p.$dispatchEvent.call(this,o.AD_IMPRESSION,this.getMetaData()),this.parent.context.parameters.slot.appendChild(e),this.parent.context.parameters.slot.appendChild(t)}},p.$dispatchEvent=function(e,t){this.flags.canSendEvent&&this.parent.dispatcher.call(this.parent.context,new o(e,t,this)),this.flags.canSendEvent=!0},r.prototype.handshakeVersion=function(){return this.parameters.version},r.prototype.initAd=function(e,t,i,r,o,s){if(!this.flags.inited){this.flags.inited=!0;var c=JSON.parse(o.AdParameters||"{}");if(console.log([2301,c]),!c.hasOwnProperty("affiliate_id"))return n.call(this,new d(d.AdError,'Missing mandatory parameters "affiliate_id" in AdParameters'));var A=c.affiliate_id;if(!c.hasOwnProperty("pid"))return n.call(this,new d(d.AdError,'Missing mandatory parameters "pid" in AdParameters'));var l=c.pid;this.parameters.size={width:e,height:t},this.parameters.pid=l,this.parameters.affiliate_id=A,this.parameters.bitrate=r,this.parameters.adParameters=c,this.parameters.creativeData=o,this.parameters.slot=s.slot,this.mediaPlayer=new p,this.mediaPlayer.init({mediapath:"",xmlLoader:""},a,this),n.call(this,new d(d.AdLoaded,{}))}},r.prototype.startAd=function(){this.flags.started||(this.flags.started=!0,this.mediaPlayer.play())},r.prototype.stopAd=function(){this.flags.stopped||(this.flags.stopped=!0)},r.prototype.skipAd=function(){this.flags.stopped||(this.flags.stopped=!0)},r.prototype.resizeAd=function(e,t){!this.flags.stopped&&this.flags.inited&&(this.parameters.slot.style.width=e+"px",this.parameters.slot.style.height=t+"px")},r.prototype.pauseAd=function(){!this.flags.stopped&&this.flags.started},r.prototype.resumeAd=function(){!this.flags.stopped&&this.flags.started},r.prototype.expandAd=function(){console.log("AdLog",'The method "expandAd" is not implemented')},r.prototype.collapseAd=function(){console.log("AdLog",'The method "collapseAd" is not implemented')},r.prototype.setAdVolume=function(e){!this.flags.stopped&&this.flags.started},r.prototype.getAdVolume=function(){},r.prototype.getAdDuration=function(){},r.prototype.getAdLinear=function(){return!0},r.prototype.getAdWidth=function(){return this.parameters.width},r.prototype.getAdHeight=function(){return this.parameters.height},r.prototype.getAdRemainingTime=function(){var e=this.mediaPlayer.getMetaData();return e.duration-e.currentTime},r.prototype.getAdExpanded=function(){return!1},r.prototype.getAdSkippableState=function(){return this.parameters.skippableState},r.prototype.getAdIcons=function(){return this.parameters.icons},r.prototype.getAdCompanions=function(){return this.parameters.companions},r.prototype.subscribe=function(e,t,i){"string"==typeof t&&(t=[t]);for(var n=0,a=t.length;n<a;n++){var r=t[n];this.subscribers[r]||(this.subscribers[r]=[]),this.subscribers[r].push({fn:e,ctx:i||null})}},r.prototype.unsubscribe=function(e,t){"string"==typeof t&&(t=[t]);for(var i=t.length;i>=0;i--){var n=this.subscribers[t[i]];if(n&&Array.isArray(n)&&n.length)for(var a=0,r=n.length;a<r;a++)n[a].fn===e&&n.splice(a,1)}},t.exports=r},{"./VPAIDEvent":1,"./VideoEvent":3,"./iFrameBridge":4}],3:[function(e,t,i){"use strict";var n=function(e,t){this.type=e,this.data=t};n.AD_READY="ready",n.AD_VOLUME_CHANGE="volumeChange",n.AD_ERROR="error",n.AD_STOP="stop",n.AD_START="creativeView",n.AD_IMPRESSION="impression",n.AD_MUTE="mute",n.AD_UNMUTE="unmute",n.AD_PAUSE="pause",n.AD_RESUME="resume",n.AD_REWIND="rewind",n.VIDEO_START="start",n.VIDEO_FIRST_QUARTILE="firstQuartile",n.VIDEO_MIDPOINT="midpoint",n.VIDEO_THIRD_QUARTILE="thirdQuartile",n.VIDEO_COMPLETE="complete",n.VIDEO_PROGRESS="progress",n.USER_CLOSE="closeLinear",n.USER_SKIP="skip",n.USER_ACCEPT_INVENTATION="acceptInvitation",n.USER_INTERACTION="interaction",n.USER_CLICK="click",t.exports=n},{}],4:[function(e,t,i){"use strict";function n(e){var e=e||r();return"undefined"==typeof window.MpFrameBridges&&(window.MpFrameBridges={}),"undefined"!=typeof window.MpFrameBridges[e]?window.MpFrameBridges[e]:(window.MpFrameBridges[e]=new d(e),window.MpFrameBridges[e])}function a(e,t,i){i.postMessage({name:e,data:t,bridgeAction:!0},"*")}function r(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0,i="x"==e?t:3&t|8;return i.toString(16)})}function d(e){this.index=e||r();var t={default:function(){}};this.execAction=function(e,i){var n=t[e]||t.default||function(){};n.call(this,i)},this.addAction=function(e,i){t[e]=i},this.showActions=function(){console.log(t)}}window.makeBridge=n,window.mp_bridge_listener=function(e){if("object"==typeof e.data&&"undefined"!=typeof e.data.bridgeAction&&1==e.data.bridgeAction){if("broadcast"==e.data.data.index&&"undefined"!=typeof window.MpFrameBridges)for(var t in window.MpFrameBridges)window.MpFrameBridges.hasOwnProperty(t)&&window.MpFrameBridges[t].execAction(e.data.name,e.data.data);n(e.data.data.index).execAction(e.data.name,e.data.data)}},"undefined"==typeof window.MpBridgeListenerAttached&&(window.addEventListener?window.addEventListener("message",mp_bridge_listener):window.attachEvent("onmessage",mp_bridge_listener),window.MpBridgeListenerAttached=!0),t.exports={Bridge:n,callAction:a}},{}],5:[function(e,t,i){"use strict";var n=e("./../models/VPAIDInterface");window.getVPAIDAd=function(){return new n}},{"./../models/VPAIDInterface":2}]},{},[5]);