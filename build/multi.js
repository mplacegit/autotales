(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by admin on 24.01.2017.
 */
var CookieDriver = {
    getCookie: function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    setCookie: function (name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    },
    deleteCookie: function (name) {
        this.setCookie(name, "", {
            expires: -1
        })
    },
    hashCode: function (s) {
        return s.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    },
    getUserID: function () {
        var userId = this.getCookie("MpVideoVisitorID");
//this.deleteCookie("MpVideoVisitorID")
        var self=this;
        if (!userId) {
            userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);

//           var s="client-id-"+navigator.userAgent+Math.random();
//           var userId=this.hashCode(s).toString(16);

            });
            self.setCookie("MpVideoVisitorID", userId,{expires:3600*24*10});

        }
        return userId;
    },
    saveObject: function (obj,ckey) {
        var serialized=btoa(encodeURIComponent(JSON.stringify(obj)));
        var key=ckey||this.hashCode(serialized).toString(16);

        this.setCookie(key,serialized,{expires:3600*24*10});
        return key;
    },
    getObject: function(key,flush){
        var rawdata=this.getCookie(key);
        var result=null;
        if(typeof rawdata!="undefined"&&rawdata){
            var serialized= decodeURIComponent(atob(rawdata));
            result=JSON.parse(serialized);
        }


        if(typeof flush!="undefined"&&flush){
            this.deleteCookie(key);
        }
        return result;

    }
};
module.exports=CookieDriver;
},{}],2:[function(require,module,exports){
'use strict';
var httpclient = require('./httpclient');
function viOS() {

	var iDevices = [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	];
	if (!!navigator.platform) {
		while (iDevices.length) {
			if (navigator.platform === iDevices.pop()){ return true; }
		}
	}

	return false;
}
function Configurator(config)
{
	var defaults={
		size:{width:"350",height:"400"},
		container:"#mp-video-widget-container-56015401b3da9-20",
		auth:{affiliate_id:"56015401b3da9",pid:"20"},
		errorFn:function(){},
		successFn:function(config){
			console.log(config);

		}
	};
	var localConfig=defaults;
	for(var i in config){
		if(config.hasOwnProperty(i)){
			localConfig[i]=config[i];
		}
	}
	//config=config||defaults;
    var self=this;
    this.loaded=false;

	this.configUrl = "https://widget.market-place.su/videooptions/" + localConfig.auth.affiliate_id + "_" + localConfig.auth.pid + ".json?p="+Math.random();
	var errorFn= config.errorFn  || function(){};
	var successFn= config.successFn || function(){};
	httpclient.ajax(this.configUrl,{errorFn:errorFn,successFn:function(res){
		try{
			var config=JSON.parse(res);
			for(var i in config){
				if(config.hasOwnProperty(i)){
					self[i]=config[i];
				}
			}
			var isNotDesktop = /Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent);
			var isIos = viOS();
			self.isDesktop=!isNotDesktop;
			//console.log(self,isIos,isNotDesktop);
			//alert("--"+isIos+"--"+isNotDesktop)
			//window.cnf=config;
			switch(true){
				case isIos:
					self.ads=config['ads-mobile'].iOS;
					break;
				case isNotDesktop:
					self.ads=config['ads-mobile'].Android;

					break;

			}
			httpclient.ajax("https://widget.market-place.su/proxy_referer/",{errorFn:function(){},successFn:function(res){
				try{
					var ref=JSON.parse(res);
					self.loaded=true;
					self.referer=ref;
					localConfig.successFn(self);
					window.parent.postMessage(config,'*');
				}catch(e){
					console.log('битая конфигурация',e);
				}
			}});

			//localConfig.successFn(self);
			//window.parent.postMessage(config,'*');
		}catch(e){
			console.log('битая конфигурация',e);
		}
	}});
};
module.exports = Configurator;
},{"./httpclient":3}],3:[function(require,module,exports){
'use strict';
var  Httpclient=
{
    ajax: function (src, config) 
	{
        var linksrc=src;
	    config = config ||{};
    	var errorFn= config.errorFn  || function(){};
		var successFn = config.successFn || function(){};
	
		var type= config.type || "GET";
		var data = config.data || {};
        var serialized_Data = JSON.stringify(data);

		type = type.toUpperCase();
        if (window.XMLHttpRequest) 
		{
            var xhttp = new XMLHttpRequest();
        }
        else 
		{
            var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (type == "GET") 
		{
             serialized_Data = null;
			if(linksrc.indexOf('?')<0){
				linksrc+="?1=1";
			}
			for(var i in data)
			{
				if(data.hasOwnProperty(i)){
					linksrc+="&"+i+"="+data[i];
				}
			}
        }
		xhttp.open(type, linksrc, true);
		xhttp.onreadystatechange = function () 
		{
            if (xhttp.readyState == 4)
			{
              if (xhttp.status == 200) 
			    {
                  successFn({response:xhttp.responseText});
                }
			else
				{
				    errorFn({status:xhttp.status});
				}
            }
			else
			{
			 errorFn({status:xhttp.readyState});
			}
        };
	     xhttp.onreadystatechange = function () 
		 {
          if (xhttp.readyState == 4)
		  {
				if (xhttp.status == 200)
				{
                 successFn(xhttp.responseText);
                }
				else
				{
				 errorFn({status:xhttp.status});
		        }
		  }
         };
        try 
		{
            xhttp.withCredentials = config.withCredentials||false;
			xhttp.send(serialized_Data);
        } catch (err){} 
    }
};
module.exports = Httpclient;
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
var httpclient = require('./httpclient');
var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');
var BridgeLib = require('./iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;

function renderControl(type,args) {
    //console.log([888888,args]);
	switch (type){
		case "timeoutEl":
		
			var ss=parseInt(args.dur)-parseInt(args.sec);
			ss=(ss>0)?ss:0;
			var txt="<span class='innerSpan'>Реклама: "+
				(ss);
			if(args.showControls&&(args.skipTime>0)) {
				txt+="  Пропустить через: "+	((args.skipTime>0)?args.skipTime:0);
			}
			txt+=" </span>";
			return txt;


			break;
		case "advLink":
			return "<span class='innerSpan' >"+args+ "</span>";

		case "skipAd":
			return "<span class='innerSpan'>Пропустить </span>";
		case "closeAd":
			return "<span class='innerSpan'> </span>";
		case "muteButton":
			return "<span class='innerSpan "+(args?"un":"")+"mute'> </span>";
		default:
			return "";
	}

}

window.MPOverControl={
CurrentLoadedXmlIndex:-1,
reportCurrentLoader:function(data){
/*
//console.log([813334,this.CurrentLoadedXmlIndex,data]);
 var preRemoteData={key:window.GlobalMyGUITemp,ind:this.CurrentLoadedXmlIndex,meta:data};
 var preToURL="http://widget2.market-place.su/admin/statistic/video/test?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData)); 
// console.log([813334,preToURL]);     
 //var img = new Image(1,1);
 //img.src =  preToURL;   
 */
}
};
function multidispatcher()
{
var self=this;
this.defaultEnded=false;
this.config={};
this.links=[];
this.tmpReadArCnt=0;
this.currentIndexListen=0;
this.ListenedIndexes={};
this.tmpReadArCnt=0;
this.emptyStart=0;
this.thirdPartyFlag=0;
this.reporter=null;




this.defaultURLs=["http://apptoday.ru/videotest/autoplay/trailers/ivancarevichiseryjvolk3_trailer2_854.mp4","http://apptoday.ru/videotest/autoplay/trailers/minions_rutrailer_1280.mp4"];
    if (typeof this.GlobalMyGUITemp == 'undefined'){
    this.GlobalMyGUITemp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
	window.GlobalMyGUITemp=this.GlobalMyGUITemp;
    }
this.fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;		
this.cookieUserid=CookieDriver.getUserID();
this.cacheloadedIndexes={};
this.cacheStatisticIndexes={};
	this.referer= 'http://apptoday.ru';
	var gachek={};
	var contrcheck={};
	//function TimerFunction(args){
	
	/*
	
	if(args.sec>0 && typeof self.player.ControllerAction=="function"){
	self.player.ControllerAction(args);
	}
	if(args.sec>0 && typeof contrcheck[args.index] == 'undefined' ){ 
	contrcheck[args.index]=1;

	}
	if(args.sec>3 && typeof gachek[args.index] == 'undefined' && typeof self.links[args.index] !="undefined"){ 
    gachek[args.index]=1;
	self.sendPixel({id:self.links[args.index].id});
	self.sendStatistic({id:self.links[args.index].id,eventName:'filterPlayMedia'}); 
    }
	*/
	//}
	/*
	this.player= new VASTPlayer(document.getElementById("container"),{timerFunc:TimerFunction});
	this.player.__private__.makePause=0;

	*/
	this.container=document.getElementById("container");
	this.placeHolder=document.getElementById("placeholder"); 
	this.pid='';
	this.affiliate_id='';
	this.queueToPlay=[];
	this.queueToPlaySemaphore=0;
	this.resourcesToPlay={};
	this.plSettings={};
	
	this.slot=null;

};
multidispatcher.prototype.setConfig = function setConfig(config,collbackFunction) 
{

this.collbackFunction=collbackFunction;



if(!config.hasOwnProperty('adslimit'))
config.adslimit=3;   
this.config=config;
this.pid=config.pid;
this.affiliate_id=config.affiliate_id;
this.links=config.ads;

if(typeof config.referer !="undefined"){
this.referer=config.referer;
//console.log([318,this.referer]);
}
this.tmpReadArCnt=this.links.length;
this.container.style.width=config.width+'px';
this.container.style.height=config.height+'px';
if(this.placeHolder){
this.placeHolder.style.width=config.width+'px';
this.placeHolder.style.height=config.height+'px';

}
this.pushQueue(0);
};
multidispatcher.prototype.checkLoadedQueue = function checkLoadedQueue() {
 var x;
 var i=0;
 for(x in  this.cacheloadedIndexes){
  console.log([3187744,x,this.cacheloadedIndexes[x],i,this.tmpReadArCnt,this.links[x].title]);
  if(this.cacheloadedIndexes[x]==0) return false; 
  i++;
 }
  console.log([3187744,this.tmpReadArCnt,i,this.emptyStart]);
 if(this.tmpReadArCnt>i) return false;
 return true;
};
multidispatcher.prototype.pushQueue = function pushQueue(ind) {
 console.log([318122,'а',this.config.adslimit]); 
 if(this.config.adslimit<=0){
 console.log([23455,this.queueToPlaySemaphore,'волк тоже']);  
 this.currentIndexListen=1;
 if(!this.queueToPlaySemaphore){ 
 this.readyToPlayThird();
 }
 return;
 }
 
  //console.log([23455,typeof this.links[ind],'волк тоже 1']); 
   var self=this; 
   if(typeof this.links[ind]=='undefined'){
   this.currentIndexListen=1; 
     //console.log([23455,this.queueToPlaySemaphore,'волк тоже 2']); 
     //var  tel = this.checkLoadedQueue();
     //console.log([23455,tel,this.queueToPlaySemaphore,'какие то птицы']);
     if(!this.emptyStart || !this.queueToPlaySemaphore){ /*ничего не было или нет*/
     this.readyToPlayThird();
     }	 
   //  if(this.checkLoadedQueue()) {
   //  console.log([23455,this.queueToPlaySemaphore,'волк не животное']);   
   //  this.currentIndexListen=1;
   //  if(!this.emptyStart){
   //  this.readyToPlayThird();
   //	 }
   //	 }
   return;
  }
   
    this.cacheloadedIndexes[ind]=0;
    var uri = this.links[ind].src.replace(/\{([a-z]+)\}/g, function(match)
    {
	var fn=match.replace(/[\{\}]+/g,'');
	switch(fn){
	case "rnd":
	return Math.random();
	break
	case "ref":
	return encodeURIComponent(self.referer); 
	break;
	}
    return match;
    });
    //console.log([400,uri]);
	//uri='http://apptoday.ru/videowidget/src/test.xml'; 
	//uri='https://apptoday.ru/autogit/1.php';

	var player = new VASTPlayer(document.getElementById("container"),{timerFunc:function(){}});
	
	player.linkIndex=ind;
	self.sendStatistic({id:self.links[ind].id,eventName:'srcRequest'});  
	
	player.loadNew(uri).then(function getLoad(res){
	console.log([4001,'плеер загрузился',res,self.links[ind].title]);
	self.cacheloadedIndexes[ind]=1;
	self.startPlayQueue(player);
	}).catch(function emitError(reason) {
	console.log([4001,'плеер не загрузился',reason,self.links[ind].title]);
	self.cacheloadedIndexes[ind]=3;
	self.pushQueue((ind+1)); 
	});
}; 
multidispatcher.prototype.sendPixel = function sendPixel(data) 
{
  
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.pid,affiliate_id:   this.affiliate_id,id_src:data.id};
  var preToURL="https://api.market-place.su/Product/video/l1quest.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
  //var preToURL="http://widget2.market-place.su/admin/statistic/video/put?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData)); 
  var img = new Image(1,1);
  img.src =  preToURL; 
  return;
};
/*
multidispatcher.prototype.changeIndex = function multidispatcher(index) {

      if(typeof this.ListenedIndexes[index]!='undefined') return;
	  			if(this.placeHolder){
				this.placeHolder.style.display="block";
				}
				    //self.pushQueue((ind+1));
				   
                    this.ListenedIndexes[index]=1;
	 				//this.queueToPlaySemaphore=0;
			        //this.startPlayQueue();
return false;
};
*/
multidispatcher.prototype.startPlayQueue = function startPlayQueue(player) {

 this.emptyStart=1;
 var self=this;

  

  if(this.queueToPlaySemaphore){ 
 	                   setTimeout(function() { 
					   self.startPlayQueue(player);
					   }, 300);  
  return; 
 }
  console.log([318122,'а',self.config.adslimit]); 
 if(this.config.adslimit<=0){
 this.readyToPlayThird();
 return;
 }

 this.queueToPlaySemaphore=1;
  var contrcheck={};
  var gachek={};
  this.clearExtraSlot();
   var userid=CookieDriver.getUserID();
   var myPlayerSettings = CookieDriver.getObject(userid);
   if(!myPlayerSettings){
    myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
   }
   this.plSettings=myPlayerSettings;
  
    player.__private__.config.timerFunc=function(args){
  	if(args.sec>0 && typeof player.ControllerAction=="function"){
	 
	 player.ControllerAction(args);  
	}
	if(args.sec>0 && typeof contrcheck[args.index] == 'undefined' ){ 
	contrcheck[args.index]=1;
	}
	if(args.sec>3 && typeof gachek[args.index] == 'undefined' && typeof self.links[args.index] !="undefined"){ 
     gachek[args.index]=1;
	 if(!player.hasOwnProperty("_ownTimer")){
	 console.log([95558,'Плеер взыграл на три!',self.links[args.index].title]);
	 player._ownTimer=1;
	 self.config.adslimit--; 
	 self.sendStatistic({id:self.links[args.index].id,eventName:'filterPlayMedia'}); 
	 self.sendPixel({id:self.links[args.index].id});
	 self.pushQueue((player.__private__.index+1)); 
	 }else{
	 console.log([95558,'мог бы!',self.links[args.index].title]); 
	 }
    }
  }


  	    player.on('AdVolumeChange', function() {
         if(typeof this.muteButton!='undefined') 
	     this.muteButton.innerHTML=renderControl("muteButton",this.adVolume);
        });
		player.once('AdStopped', function() {
	              self.queueToPlaySemaphore=0; 
                  console.log([95558,'Плеер закончился!',self.currentIndexListen,self.links[player.__private__.index].title]);
				  if(self.currentIndexListen){ self.readyToPlayThird(); return; 
				   }else{
				 // self.checkLoadedQueue(); 
				  console.log([955887,self.links.length]);
				  if(self.checkLoadedQueue()){
				    self.readyToPlayThird(); return; 
				  }
				  }
        });
		player.once('AdError', function(reason) {
				    var mess = '';
  	                if(typeof reason != 'undefined' && typeof reason.message != 'undefined'){
	                mess=reason.message;
	                }
	                else{
	                if(typeof reason != 'undefined') 
                    mess=JSON.stringify(reason);
	                }
	self.sendStatistic({id:self.links[player.__private__.index].id,eventName:'errorPlayMedia',mess:mess}); 
	console.log([95558,'Ошибка плеера лог!',self.links[player.__private__.index].title,mess]); 
			    });	
   player._reporter.PlayToBridge=function(type,arr){
   self.sendStatistic({id:self.links[player.__private__.index].id,eventName:type,mess:''}); 
   //console.log([11234,"всё --- ",type]);
   switch(type){
   case "firstQuartile":
   //console.log([122223,player.hasOwnProperty("_ownTimer")]);
   if(!player.hasOwnProperty("_ownTimer")){
	 console.log([95558,'Плеер взыграл по три!',self.links[player.__private__.index].title]);
	 player._ownTimer=1;
	 self.config.adslimit--; 
	 self.sendStatistic({id:self.links[player.__private__.index].id,eventName:'filterPlayMedia'}); 
	 self.sendPixel({id:self.links[player.__private__.index].id});
	 self.pushQueue((player.__private__.index+1)); 
	 }
   break;
   }
   //console.log([122222,type,arr,self.config.index]);
   
   CallAction('adEvent',{index:self.config.index,eventName:type},window.parent);
   }
    player.preparePlay(true).then(function startAd(){
    console.log([95558,'Плеер готов!',player.__private__.pType,self.links[player.__private__.index].title]);

	
	
			    player.startAd().then(function f1(){
				if(myPlayerSettings.mute){
		        player.adVolume=0;
		        }else{
		        player.adVolume=0.6;
	            }
				
			   	self.container.style.opacity="1";
				self.container.style.filter="alpha(opacity=50)";
				//console.log('опасити');
				if(self.placeHolder){
				self.placeHolder.style.display="none";
				}
				
     			if(player.__private__.pType==3 && player.__private__.index>=0){ //HTML player стандарт линк
				self.createExtraSlot(player);
				}
				self.container.style.display="block";
				var du=document.getElementById("container2");
				if(du) du.style.display="none";
				
			   }).catch(function onError(e){
			       console.log([95558,'Плеер не заиграл!',self.links[player.__private__.index].title,reason]); 
			   });
    }).catch(function onError(reason){
     		   
			   console.log([95558,'Плеер не готов!',self.links[player.__private__.index].title,reason]); 
			   self.queueToPlaySemaphore=0;
			   self.pushQueue((player.__private__.index+1)); 
	          
    });

 console.log([4005,player]);
 
};
/*
multidispatcher.prototype.startPlayQueue = function startPlayQueue() {
 this.emptyStart=1;
 var self=this;
 
 if(this.queueToPlaySemaphore){ 
 	                   setTimeout(function() { 
					   self.startPlayQueue();
					   }, 200); 
 return; 
 }
 var index=this.queueToPlay.shift();

 if(typeof index=='undefined'){ 
 if(this.currentIndexListen && !this.queueToPlaySemaphore){ 
   this.readyToPlayThird();
   }else{
   	setTimeout(function() { 
	self.startPlayQueue();
	}, 200); 
  }
  return; 
 }

 var userid=CookieDriver.getUserID();
 //console.log(31855,'userid',userid);
 var myPlayerSettings = CookieDriver.getObject(userid);
 if(!myPlayerSettings){
  myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
 }
  
			
 this.plSettings=myPlayerSettings;
 this.queueToPlaySemaphore=1;
 this.reporter=self.resourcesToPlay[index];
   this.clearExtraSlot();
   this.container.innerHTML='';
      
    this.player.preparePlay(this.resourcesToPlay[index]).then(function startAd(){
	console.log([95558,'Плеер загрузился!',self.player.adVolume,self.links[index].title]);
 			    self.player.once('AdStopped', function() {
				console.log([95558,'Плеер отыграл!',self.links[index].title]);
			    self.changeIndex(index);
				return;
			    });
				self.player.once('AdError', function(reason) {
				    var mess = '';
  	                if(typeof reason != 'undefined' && typeof reason.message != 'undefined'){
	                mess=reason.message;
	                }
	                else{
	                if(typeof reason != 'undefined')
                    mess=JSON.stringify(reason);
	                }
				 self.sendStatistic({id:self.links[index].id,eventName:'errorPlayMedia',mess:mess}); 
				 console.log([95558,'Плеер ошибся!',self.links[index].title,mess]);
			    });	


			    self.player.startAd().then(function f1(){
				
				self.container.style.opacity="1";
				self.container.style.filter="alpha(opacity=50)";
				console.log('опасити');
				if(self.placeHolder){
				self.placeHolder.style.display="none";
				}
				
				if(self.resourcesToPlay[index].playType==3 && self.player.__private__.index>=0){ //HTML player стандарт линк
				self.createExtraSlot();
				}
				self.container.style.display="block";
				var du=document.getElementById("container2");
				if(du) du.style.display="none";
			    console.log([31855,'плейер',self.plSettings.mute]);
			    if(self.plSettings.mute){
		        self.player.adVolume=0;
		        }else{
		        self.player.adVolume=0.6;
	            }
			   
			    console.log([95558,'Плеер заиграл!',self.resourcesToPlay[index].playType,self.links[index].title]);
			   }).catch(function onError(e){
			    console.log([95558,'Плеер незахотел!',self.links[index].title,e]);
			   });
	}).catch(function onError(reason){
					var mess = '';
  	                if(typeof reason != 'undefined' && typeof reason.message != 'undefined'){
	                mess=reason.message;
	                }
	                else{
	                if(typeof reason != 'undefined')
                    mess=JSON.stringify(reason);
	                }
				    self.sendStatistic({id:self.links[index].id,eventName:'errorPlayMedia',mess:mess}); 
	
	
	console.log([95558,'Плеер не грузится!',self.links[index].title,reason]);
	self.changeIndex(index);
    });
	 
};
*/
multidispatcher.prototype.checkMuteButton = function checkMuteButton()
{
     // console.log([31855,'мут',this.player.adVolume]);
      //if(typeof this.player.muteButton!='undefined') 
	  //this.player.muteButton.innerHTML=renderControl("muteButton",this.player.adVolume);

};

multidispatcher.prototype.createExtraSlot = function createExtraSlot(player) 
{
 
  var self=this;
  player.isPaused=0;
  player.isClicked=0;
  this.slot=document.createElement("DIV");
  this.slot.setAttribute("id","videoslot");
  this.slot.style.width=this.config.width+"px";
  this.slot.style.height=this.config.height+"px";
  this.slot.style.border="1px solid #000000";
  this.slot.style.position="absolute";
  this.slot.style.top="0";
  this.slot.style.left="0";
  this.slot.style.zIndex=999;
  this.container.style.position="relative";
  this.container.appendChild(this.slot);
  var isClickable=[];
  var controls=[];
  var skipTime=[];
  var skipTime2=[];  
  var linkTxt=[];
  var skipAd=[];
  var addClick=[];
  
  
  player.ControllerAction=function(args){  
     if(args.index==-1){
     // console.log([1233333,'или четыре']);
      }
      if(!skipTime.length){ 
	  skipTime.push("00:10");
	  }
      if(!skipTime2.length){ 
	  skipTime2.push("00:05");
	   }
	  var skipTimeInt=(parseInt(skipTime[0].split(":")[0])*60+parseInt(skipTime[0].split(":")[1]) )%parseInt(args.dur);
	  var skipTimeInt2=(parseInt(skipTime2[0].split(":")[0])*60+parseInt(skipTime2[0].split(":")[1]))%parseInt(args.dur);
      if(skipTimeInt>skipTimeInt2){
	  skipTimeInt=skipTimeInt2;
	  }
	  var showCLose=(skipTimeInt2<=parseInt(args.sec)&&skipTimeInt2>0);
	  var showSkip=(skipTimeInt<=parseInt(args.sec)&&skipTimeInt>0);
	  args.skipTime=skipTimeInt-parseInt(args.sec);
	  args.showControls=(controls[0]=="1");
	  var txt=renderControl("timeoutEl",args);
	  if(typeof player.timeoutDiv!="undefined")
	  player.timeoutDiv.innerHTML=txt;
	  if(controls[0]=="1" && showCLose){
	  player.closeDiv.style.display='block';
	  }
	  if(controls[0]=="1"&&showSkip){
	  player.skipDiv.style.display='block';
	  }
  };  
  
  
   
  player.drawControls=function(){ 
		
		self.clickable=document.createElement("DIV");
		self.clickable.setAttribute("id","clickable");
		self.clickable.style.width=self.config.width+"px";
		self.clickable.style.height=self.config.height+"px";
		self.clickable.style.border="1px solid #000000";
		self.clickable.style.position="absolute";
		//self.clickable.style.color="#FFFFFF";
		//self.clickable.innerHTML="absolute кликни в сторону<br> нестандарт<br> нестандарт <br> нестандарт";
		self.clickable.style.top="0";
		self.clickable.style.left="0";
		self.clickable.style.zIndex=1000;
    	self.resumeButton=document.createElement("DIV");
		self.resumeButton.style.zIndex=1003;
		self.resumeButton.style.color="#FFFFFF";
		self.resumeButton.style.width="100%";
		self.resumeButton.style.height="100%";
		self.resumeButton.style.cursor="pointer";
        self.resumeButton.style.display="none";
		self.resumeButton.className="resume-play";
		self.clickable.appendChild(self.resumeButton);
		self.slot.appendChild(self.clickable);
		//timeoutDiv
		var timeoutDiv=document.createElement('div');
		timeoutDiv.id="timeoutDiv";
		player.timeoutDiv=timeoutDiv;
		self.slot.appendChild(timeoutDiv);
				//closeDiv
		var closeDiv=document.createElement('div');
		closeDiv.id="closeDiv";
		player.closeDiv=closeDiv;
		self.slot.appendChild(closeDiv);
		closeDiv.innerHTML=renderControl("closeAd");
		closeDiv.style.display='none';
		closeDiv.onclick=function(e){
			e.preventDefault();
			player._reporter.manualCase('close');
			player.stopAd();
		};
		//skipDiv
		var skipDiv=document.createElement('div');
		player.skipDiv=skipDiv;
		skipDiv.id="skipDiv";
		
		self.slot.appendChild(skipDiv);
		skipDiv.innerHTML=renderControl("skipAd");
		skipDiv.style.display='none';
		skipDiv.onclick=function(e){
			e.preventDefault();
			player._reporter.manualCase('skip');
			for(var i =0;i<skipAd.length;i++){
				new Image().src = skipAd[i];
			}
		player.stopAd();
		};
				//advLink
		var advLink=document.createElement('div');
		advLink.id="advLink";
		player.advLink=advLink;
		self.slot.appendChild(advLink);
		advLink.innerHTML=renderControl("advLink",decodeURIComponent(linkTxt[0]));
		var clickThrough = player.__private__.vast.get('ads[0].creatives[0].videoClicks.clickThrough'); 
		if(!clickThrough){
			advLink.style.display='none';
		}
		advLink.onclick=function(e){
			e.preventDefault();
			for(var i =0;i<addClick.length;i++){
				new Image().src = addClick[i];
			}
			self.ConrolePaused(1);
		};
		//muteButton
		var muteButton=document.createElement('div');
		muteButton.id="muteButton";
		muteButton.style.border="1px solid red";
		muteButton.style.zIndex=9999;
		muteButton.style.position='absolute';
		player.muteButton=muteButton;
		self.slot.appendChild(muteButton);
		muteButton.innerHTML=renderControl("muteButton",player.adVolume);
		muteButton.onclick=function(e){
			e.preventDefault();
			player.adVolume=player.adVolume?0:0.6;
		var userid=CookieDriver.getUserID();
		if(!player.adVolume){
		self.plSettings.mute=true;
		}else{
		self.plSettings.mute=false;
		}
        CookieDriver.saveObject(self.plSettings,userid);
			return false;
		}
    };
    player.__private__.vast.map('ads[0].extensions', function(extension){
			
			  if(extension.type=="linkTxt" && extension.value){
			  linkTxt.push(extension.value.replace(/^\s+|\s+$/,'')); 
			  }
			  if(extension.type=="isClickable" && extension.value){
			   isClickable.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
			  if(extension.type=="controls" && extension.value){
			  controls.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
			  if(extension.type=="skipTime" && extension.value){
			 //   console.log(['двандва',extension]);
              skipTime.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
			  if(extension.type=="skipTime2" && extension.value){
			   //console.log(['двантри',extension]);
			  skipTime2.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
				if(extension.type=="skipAd" && extension.value){
					skipAd.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
				if(extension.type=="addClick" && extension.value){
					addClick.push(extension.value.replace(/^\s+|\s+$/,''));
			  }
            });

			
			if(!linkTxt.length)
			linkTxt.push("Перейти на сайт рекламодателя");
			if(!isClickable.length)
			isClickable.push(0);
		
	player.drawControls();
    self.clickable.onclick=function(){
    self.ConrolePaused(isClickable[0],player);
  }; 
   
};
multidispatcher.prototype.ConrolePaused = function ConrolePaused(isClickable,player) 
{
 if(!player) return;
 if(!player.isPaused){
 if(typeof this.resumeButton)
  this.resumeButton.style.display="block";
  player.isPaused=1;
  player.pauseAd();
  player._reporter.manualCase('clickThrough');
   var clickThrough =  player.__private__.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
   //console.log([4445,clickThrough]); 
   var playerHandles=isClickable;
           if (playerHandles && clickThrough) {
               window.open(clickThrough);
           }
  }else{
  if(typeof this.resumeButton!='undefined')
  this.resumeButton.style.display="none";
  player.isPaused=0;
  player.resumeAd();
  }
  
};
multidispatcher.prototype.clearExtraSlot = function clearExtraSlot() 
{

if (typeof this.resumeButton!='undefined'){
delete this.resumeButton;
}

if(this.slot){
this.container.removeChild(this.slot);
}
this.slot=null;
};
multidispatcher.prototype.readyToPlayThird=function readyToPlayThird(){
if(this.thirdPartyFlag) return;
   
  this.thirdPartyFlag=1;
   this.clearExtraSlot();
 
   this.container.innerHTML='';
   this.container.style.display='none';
   if(typeof this.collbackFunction =='function'){
   console.log("переход 2");
   this.collbackFunction(this.config);
   }
};
multidispatcher.prototype.sendStatistic = function sendStatistic(data) 
{

  var m='';
  if (typeof data.eventName=='undefined'){
  return;
  }
    //console.log([400,data.eventName]);
  if (typeof this.cacheStatisticIndexes[data.id]=='undefined'){
  this.cacheStatisticIndexes[data.id]={};
  }
  if (typeof data.mess!='undefined'){
  m=data.mess;
  }
 if (typeof this.cacheStatisticIndexes[data.id][data.eventName]!='undefined'){
  return;
 }
  this.cacheStatisticIndexes[data.id][data.eventName]=1;
  
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.pid,affiliate_id:this.affiliate_id,cookie_id:this.cookieUserid,id_src:data.id,event:data.eventName,mess:m}; 
  var toURL="https://api.market-place.su/Product/video/l1stat.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
    //console.log([955544,data.id,data.eventName,toURL]);
   var img = new Image(1,1);
   img.src = toURL; 
   
};
multidispatcher.prototype.overTvigle = function overTvigle() 
{

this.container.innerHTML='';  
this.container.style.display='block';
	this.container.style.opacity="1";
	this.container.style.filter="alpha(opacity=50)";
				if(this.placeHolder){
				this.placeHolder.style.display="block";
				}
				
			//console.log([31812,this.config.isDesktop]);		
			if(!this.config.isDesktop){
			this.defaultEnded=1;
			this.checkDefaultTrailer(10); 
			return;
			}	
		//console.log([3181,'твил']);		
    var frame=document.createElement('iframe');
    frame.width=this.config.width;
    frame.height=this.config.height;
    frame.frameBorder=0;
    frame.margin=0;
	//alert(JSON.stringify(this.config));
var url="/frame_default.html?width="+this.config.width+"&height="+this.config.height+"&affiliate_id=" + this.affiliate_id+ "&pid="+this.pid+"&key="+this.GlobalMyGUITemp+"&fromUrl="+this.fromUrl+"&rnd="+Math.random();

    frame.src=url;
	this.container.appendChild(frame);
	this.checkDefaultTrailer(35);
	
};
multidispatcher.prototype.checkDefaultTrailer = function checkDefaultTrailer(cnt) {

	if(cnt<=0) return;
	if(typeof this.defaultEnded=='undefined' || !this.defaultEnded){

		cnt--;
		var self=this;
		setTimeout(function(){
				self.checkDefaultTrailer(cnt);
			},
			500);
		return;
	}
	var min=0;
	var max=1;
	var ran = Math.floor(Math.random() * (max -  min + 1)) + min;

	this.createTrailer(this.defaultURLs[ran]);
	
}; 
multidispatcher.prototype.moveShirma=function() {
//console.log([318,'опен ширма']);
				if(this.placeHolder){
				this.placeHolder.style.display="none";
				}
};
multidispatcher.prototype.createTrailer=function(src) {
     this.container.innerHTML='';  
	 //this.container.style.display='block';  
     var mediafiles=[{apiFramework:null
	 ,bitrate:692
	 ,delivery:"progressive"
	 ,height:360
	 ,id:"1"
	 ,maintainAspectRatio:null
	 ,scalable:null
	 ,type:"video/mp4"
	 ,uri:src
	 ,width:640}];

	 var self=this;
    var player = new VASTPlayer(document.getElementById("container"),{timerFunc:function(){}});
	player.__private__.index=-1;
			    player.PlayMp4({mediafiles:mediafiles}).then(function startAd(player){ 
	            //console.log([318553,'про волка']);   
			 
		   
		    player.__private__.player.video.onended = function() {
            self.container.innerHTML='';  
			self.container.style.display='none';
            };
			    player.startAd().then(function f1(){
				player.adVolume=0;
				self.container.style.opacity="1";
				self.container.style.filter="alpha(opacity=50)";
				if(self.placeHolder){
				self.placeHolder.style.display="none";
				}
				self.container.style.display="block";
				var du=document.getElementById("container2");
				if(du) du.style.display="none";
				
			   }).catch(function onError(e){
			  
			   });
			
			
			
	        }).catch(function onError(res){
			   console.log([454,'плеер сорвался',res]);  
			        self.container.innerHTML='';  
	                self.container.style.display='block'; 
			   
		    }); 
/*
 var userid=CookieDriver.getUserID();
  //console.log([318553,'user трейлер',userid]);  
 var myPlayerSettings = CookieDriver.getObject(userid);
 //console.log([318553,'мут тру',myPlayerSettings]);  
 if(!myPlayerSettings){
  myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
 }
   
 this.plSettings=myPlayerSettings;
 	  			if(this.placeHolder){
				this.placeHolder.style.display="none";
				}

 
		 this.player.PlayMp4({mediafiles:mediafiles}).then(function startAd(player){
	//console.log([318553,'мут',self.plSettings.mute]);   
			    if(self.plSettings.mute){
		        self.player.adVolume=0;
		        }else{
		       // self.player.adVolume=0.6;
	            }
		 
            self.player.__private__.player.video.onended = function() {
            self.container.innerHTML='';  
			self.container.style.display='none';
            };
			self.player.__private__.player.video.onvolumechange = function() {
			
	var userid=CookieDriver.getUserID();
    if(this.muted){
    self.plSettings.mute=true;
    }else{
    self.plSettings.mute=false;
    }
//console.log([318553,'саве 2',self.plSettings.mute]);  
  // CookieDriver.saveObject(self.plSettings,userid);
            //self.container.innerHTML='';  
			//self.container.style.display='none';
            };
			
	        }).catch(function onError(res){
			   console.log([454,'плеер сорвался',res]);  
			        self.container.innerHTML='';  
	                self.container.style.display='block'; 
			   
		    }); 
*/

};

module.exports = multidispatcher; 
			     
},{"./CookieDriver":1,"./httpclient":3,"./iFrameBridge":4,"vast-player":24}],6:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 20; 

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;
   //console.log([55555,this._events]); 
  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

 if(typeof this._events[type]=='undefined'){


 return false;
 }
  handler = this._events[type];
  
  if (isUndefined(handler))
    return false;
   
  if (isFunction(handler)) {

    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++){
	  //console.log([15444,arguments]);
	  //console.log([44555,type,listeners[i]]); 
      listeners[i].apply(this, args);
	  }
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
'use strict';
var immediate = require('immediate');

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  
  while (++i < len) {
  //console.log([ 31865,self.queue[i].callRejected]);
    self.queue[i].callRejected(error);
	//console.log([ 31865,'коль']);
  }
   //console.log([ 31865,'финиш']);
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
     //console.log(111231,'entrie',called);
  var called = false;
  var calledError = false;
  function onError(value) {
  ;
    if (called && calledError) {
      return;
    }
    called = true;

	//console.log(31865,'lie error', calledError,handlers.reject,value);
	calledError = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
   //console.log(111231,'success',called,value);
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"immediate":8}],10:[function(require,module,exports){
(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var
    toStr = Object.prototype.toString,
    _hasOwnProperty = Object.prototype.hasOwnProperty;

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
      return true;
    } else {
      for (var i in value) {
        if (_hasOwnProperty.call(value, i)) {
          return false;
        }
      }
      return true;
    }
  }

  function toString(type){
    return toStr.call(type);
  }

  function isNumber(value){
    return typeof value === 'number' || toString(value) === "[object Number]";
  }

  function isString(obj){
    return typeof obj === 'string' || toString(obj) === "[object String]";
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  function isArray(obj){
    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function set(obj, path, value, doNotReplace){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isString(path)) {
      return set(obj, path.split('.'), value, doNotReplace);
    }
    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      var oldVal = obj[currentPath];
      if (oldVal === void 0 || !doNotReplace) {
        obj[currentPath] = value;
      }
      return oldVal;
    }

    if (obj[currentPath] === void 0) {
      if (isNumber(currentPath)) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return set(obj[currentPath], path.slice(1), value, doNotReplace);
  }

  function del(obj, path) {
    if (isNumber(path)) {
      path = [path];
    }

    if (isEmpty(obj)) {
      return void 0;
    }

    if (isEmpty(path)) {
      return obj;
    }
    if(isString(path)) {
      return del(obj, path.split('.'));
    }

    var currentPath = getKey(path[0]);
    var oldVal = obj[currentPath];

    if(path.length === 1) {
      if (oldVal !== void 0) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      }
    } else {
      if (obj[currentPath] !== void 0) {
        return del(obj[currentPath], path.slice(1));
      }
    }

    return obj;
  }

  var objectPath = {};

  objectPath.ensureExists = function (obj, path, value){
    return set(obj, path, value, true);
  };

  objectPath.set = function (obj, path, value, doNotReplace){
    return set(obj, path, value, doNotReplace);
  };

  objectPath.insert = function (obj, path, value, at){
    var arr = objectPath.get(obj, path);
    at = ~~at;
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }
    arr.splice(at, 0, value);
  };

  objectPath.empty = function(obj, path) {
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return void 0;
    }

    var value, i;
    if (!(value = objectPath.get(obj, path))) {
      return obj;
    }

    if (isString(value)) {
      return objectPath.set(obj, path, '');
    } else if (isBoolean(value)) {
      return objectPath.set(obj, path, false);
    } else if (isNumber(value)) {
      return objectPath.set(obj, path, 0);
    } else if (isArray(value)) {
      value.length = 0;
    } else if (isObject(value)) {
      for (i in value) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      }
    } else {
      return objectPath.set(obj, path, null);
    }
  };

  objectPath.push = function (obj, path /*, values */){
    var arr = objectPath.get(obj, path);
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }

    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
  };

  objectPath.coalesce = function (obj, paths, defaultValue) {
    var value;

    for (var i = 0, len = paths.length; i < len; i++) {
      if ((value = objectPath.get(obj, paths[i])) !== void 0) {
        return value;
      }
    }

    return defaultValue;
  };

  objectPath.get = function (obj, path, defaultValue){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return defaultValue;
    }
    if (isString(path)) {
      return objectPath.get(obj, path.split('.'), defaultValue);
    }

    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      if (obj[currentPath] === void 0) {
        return defaultValue;
      }
      return obj[currentPath];
    }

    return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
  };

  objectPath.del = function(obj, path) {
    return del(obj, path);
  };

  return objectPath;
});
},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],14:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":12,"./encode":13}],15:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],16:[function(require,module,exports){
var objectPath = require('object-path');
var sortBy;
var sort;
var type;

/**
 * Filters args based on their type
 * @param  {String} type Type of property to filter by
 * @return {Function}
 */
type = function(type) {
    return function(arg) {
        return typeof arg === type;
    };
};

/**
 * Return a comparator function
 * @param  {String} property The key to sort by
 * @param  {Function} map Function to apply to each property
 * @return {Function}        Returns the comparator function
 */
sort = function sort(property, map) {
    var sortOrder = 1;
    var apply = map || function(_, value) { return value };

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function fn(a,b) {
        var result;
        var am = apply(property, objectPath.get(a, property));
        var bm = apply(property, objectPath.get(b, property));
        if (am < bm) result = -1;
        if (am > bm) result = 1;
        if (am === bm) result = 0;
        return result * sortOrder;
    }
};

/**
 * Return a comparator function that sorts by multiple keys
 * @return {Function} Returns the comparator function
 */
sortBy = function sortBy() {

    var args = Array.prototype.slice.call(arguments);
    var properties = args.filter(type('string'));
    var map = args.filter(type('function'))[0];

    return function fn(obj1, obj2) {
        var numberOfProperties = properties.length,
            result = 0,
            i = 0;

        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = sort(properties[i], map)(obj1, obj2);
            i++;
        }
        return result;
    };
};

/**
 * Expose `sortBy`
 * @type {Function}
 */
module.exports = sortBy;
},{"object-path":10}],17:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {

  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr && this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * @deprecated
 */
Response.prototype.parse = function serialize(fn){
  if (root.console) {
    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
  }
  this.serialize(fn);
  return this;
};

Response.prototype.serialize = function serialize(fn){
  this._parser = fn;
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
 // alert(this._timeout);
  this._timeout=6000;
  var timeout = this._timeout;
  //timeout=200;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":18,"./request":20,"./request-base":19,"emitter":6,"reduce":15}],18:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

module.exports = isObject;

},{}],19:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){

  this._timeout = ms;
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {
  this._getFormData().append(name, val);
  return this;
};

},{"./is-object":18}],20:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).withCredentials().end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method).withCredentials();
  }

  return new RequestConstructor(method, url).withCredentials();
}

module.exports = request;

},{}],21:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],22:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],23:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":22,"inherits":21,"pBGvAp":11}],24:[function(require,module,exports){
module.exports = require('./lib/VASTPlayer');

},{"./lib/VASTPlayer":28}],25:[function(require,module,exports){
'use strict';

function proxy(event, source, target) {
    source.on(event, function emit(/*...args*/) {
        var args = [], length = arguments.length;
        while (length--) { args[length] = arguments[length]; }

        target.emit.apply(target, [event].concat(args));
    });
}

function init(source, target, events) {
    events.forEach(function(event) {
        if (target.listeners(event).length > 0) {
            proxy(event, source, target);
        }
    });

    target.on('newListener', function handleNewListener(type) {
        if (events.indexOf(type) > -1 && target.listeners(type).length < 1) {
            proxy(type, source, target);
        }
    });
}

function EventProxy(events) {
    this.events = events.slice();

    this.__private__ = {
        target: null,
        source: null
    };
}

EventProxy.prototype.from = function from(source) {
    this.__private__.source = source;

    if (this.__private__.target) {
        init(source, this.__private__.target, this.events);
    }

    return this;
};

EventProxy.prototype.to = function to(target) {
    this.__private__.target = target;

    if (this.__private__.source) {
        init(this.__private__.source, target, this.events);
    }

    return this;
};

module.exports = EventProxy;

},{}],26:[function(require,module,exports){
'use strict';

var VideoTracker = require('./VideoTracker');
var inherits = require('util').inherits;
var EVENTS = require('./enums/HTML_MEDIA_EVENTS');

function HTMLVideoTracker(video) {
    var self = this;

    VideoTracker.call(this, Math.floor(video.duration || 0)); // call super()

    this.video = video;

    [
        EVENTS.PLAYING,
        EVENTS.PAUSE,
        EVENTS.TIMEUPDATE
    ].forEach(function(event) {
        return video.addEventListener(event, function onevent() {
            return self.tick();
        }, false);
    });
}
inherits(HTMLVideoTracker, VideoTracker);

HTMLVideoTracker.prototype._getState = function _getState() {
    return {
        playing: !this.video.paused,
        currentTime: this.video.currentTime
    };
};

module.exports = HTMLVideoTracker;

},{"./VideoTracker":30,"./enums/HTML_MEDIA_EVENTS":31,"util":23}],27:[function(require,module,exports){
'use strict';

var EVENTS = require('./enums/VPAID_EVENTS');

function identity(value) {
    return value;
}

function fire(pixels, mapper) {

    (pixels || []).forEach(function(src) {
	src=src.replace(/^\s+|\s+$/,'');
	//if(typeof window.regularMassive.files[src]=='undefined'){
	 //console.log([7355,'передой',src]);
	// window.regularMassive.files[src]=3;
	//}else{
	 //window.regularMassive.files[src]=0;
	//}
	  //if(/tns-counter/.exec(src)){
	  //console.log([7351,src]);
	 // }
	  //console.log([7355,'передой',src]);
      new Image().src = mapper(src);
    });
}

function PixelReporter(pixels, mapper) {
    this.pixels = pixels.reduce(function(pixels, item) {
	     //console.log([77774,item.event]);
        (pixels[item.event] || (pixels[item.event] = [])).push(item.uri);
        return pixels;
    }, {});

    this.__private__ = {
        mapper: mapper || identity
    };
}
PixelReporter.prototype.manualCase = function manualCase(type) {
 var pixels = this.pixels;
 var customMapper = this.__private__.mapper;
  var self = this;
    function fireType(type, mapper, predicate) {
        function pixelMapper(url) {
            return customMapper((mapper || identity)(url));
        }

            //return function firePixels() {
			
		    //console.log([7359,type,pixels[type]]);
            if (!predicate || predicate()){
			
			//window.regularMassive.tracked[type]=pixels[type];
			     self.PlayToBridge(type,pixels[type]);
                 fire(pixels[type], pixelMapper);
            }else{
			//console.log([7358,type,pixels[type]]); 
			}
        //};
    }
fireType(type);
};
PixelReporter.prototype.PlayToBridge = function PlayToBridge(type,arr) {
  
};
PixelReporter.prototype.track = function track(vpaid) {
    var pixels = this.pixels;
    var self = this;
    var customMapper = this.__private__.mapper;
    var lastVolume = vpaid.adVolume;

    function fireType(type, mapper, predicate) {
        function pixelMapper(url) {
            return customMapper((mapper || identity)(url));
        }
       
        return function firePixels() {
            if (!predicate || predicate()) {
			/*
			var keyy='1';
			id_src=1008;
			if(typeof window.GlobalMyGUITemp !='undefined'){
			var keyy=window.GlobalMyGUITemp
			}
			if(typeof window.Globalid_src !='undefined'){
			var id_src=window.Globalid_src;
			}
			var remdata={event:type,key:keyy,id_src:id_src};
			var src1="http://api.market-place.su/Product/video/ios.php?p="+Math.random()+"&data="+encodeURIComponent(JSON.stringify(remdata));
			//alert(remdata);
			new Image().src = src1;
			*/
			//console.log([7359,type,pixels[type]]);
			//window.regularMassive.tracked[type]=pixels[type];
				self.PlayToBridge(type,pixels[type]);
            fire(pixels[type], pixelMapper);
            }else{
			//console.log([7358,type,pixels[type]]); 
			}
        };
    }
	 // vpaid.on(EVENTS.AdVideoStart, fireType('start'));
	// vpaid.on(EVENTS.AdStarted, fireType('creativeView'));
	 
	 //vpaid.on(EVENTS.AdVideoFirstQuartile, fireType('firstQuartile'));
	 

    vpaid.on(EVENTS.AdSkipped, fireType('skip'));
    vpaid.on(EVENTS.AdStarted, fireType('creativeView'));
   vpaid.on(EVENTS.AdVolumeChange, fireType('unmute', null, function() {
        return lastVolume === 0 && vpaid.adVolume > 0;
    }));
    vpaid.on(EVENTS.AdVolumeChange, fireType('mute', null, function() {
        return lastVolume > 0 && vpaid.adVolume === 0;
    }));
    vpaid.on(EVENTS.AdImpression, fireType('impression'));
    vpaid.on(EVENTS.AdVideoStart, fireType('start'));
    vpaid.on(EVENTS.AdVideoFirstQuartile, fireType('firstQuartile'));
    vpaid.on(EVENTS.AdVideoMidpoint, fireType('midpoint'));
    vpaid.on(EVENTS.AdVideoThirdQuartile, fireType('thirdQuartile'));
    vpaid.on(EVENTS.AdVideoComplete, fireType('complete'));
    vpaid.on(EVENTS.AdClickThru, fireType('clickThrough'));
    vpaid.on(EVENTS.AdUserAcceptInvitation, fireType('acceptInvitationLinear'));
    vpaid.on(EVENTS.AdUserMinimize, fireType('collapse'));
    vpaid.on(EVENTS.AdUserClose, fireType('closeLinear'));
    vpaid.on(EVENTS.AdPaused, fireType('pause'));
    vpaid.on(EVENTS.AdPlaying, fireType('resume'));
    vpaid.on(EVENTS.AdError, fireType('error', function(pixel) {
        return pixel.replace(/\[ERRORCODE\]/g, 901);
    }));

    vpaid.on(EVENTS.AdVolumeChange, function updateLastVolume() {
        lastVolume = vpaid.adVolume;
    });
	
};

module.exports = PixelReporter;

},{"./enums/VPAID_EVENTS":33}],28:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var VAST = require('vastacular').VAST;
var JavaScriptVPAIDPlayer = require('./players/JavaScriptVPAID');
var FlashVPAIDPlayer = require('./players/FlashVPAID');
var HTMLVideoPlayer = require('./players/HTMLVideo');
var IOSVideoPlayer = require('./players/IOSVideo');
var MIME = require('./enums/MIME');
var EVENTS = require('./enums/VPAID_EVENTS');
var EventProxy = require('./EventProxy');
var LiePromise = require('lie');
var PixelReporter = require('./PixelReporter');

/*
function simulateClick() {
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var cb = document.getElementById('container'); 
  var canceled = !cb.dispatchEvent(event);
  if (canceled) {
    // A handler called preventDefault.
   // alert("canceled");
  } else {
    // None of the handlers called preventDefault.
    //alert("not canceled");
  }
}
*/
function isAndr() {
return /Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent);
}
function iOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];
//return true;
  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  //return isAndr();
  return false;
}
function defaults(/*...objects*/) {
    var result = {};
    var length = arguments.length;
    var index, object;
    var prop, value;

    for (index = 0; index < length; index++) {
        object = arguments[index] || {};

        for (prop in object) {
            value = object[prop];

            if (result[prop] === undefined) {
                result[prop] = value;
            }

            if (typeof value === 'object') {
                result[prop] = defaults(result[prop], value);
            }
        }
    }
  
    return result;
}

function identity(value) {
    return value;
}

function getNotReadyError() {
    return new Error('VASTPlayer not ready.');
}

function proxy(method) {
    return function callMethod() {
        var self = this;
        var player = this.__private__.player;

        if (!this.ready) {
            return LiePromise.reject(getNotReadyError());
        }
        return player[method].apply(player, arguments).then(function() {
            return self;
        });
    };
}

function proxyProp(property) {
    return {
        get: function get() {
            if (!this.ready) { throw getNotReadyError(); }

            return this.__private__.player[property];
        },

        set: function set(value) {
            if (!this.ready) { throw getNotReadyError(); }

            return (this.__private__.player[property] = value);
        }
    };
}
function VASTPlayer(container, config) {
    var self = this;
    EventEmitter.call(this); // call super()
    this.__private__ = {
	    index: -1,
        container: container,
        config: defaults(config, {
            vast: {
                resolveWrappers: true,
                maxRedirects: 5
            },
            tracking: {
                mapper: identity
            }
        }),

        vast: null,
        ready: false,
        player: null,
		pType:0
    };
this.on(EVENTS.AdRemainingTimeChange, function onAdRemainingTimeChange(args) {
var sec =self.adRemainingTime;
var duration=self.adDuration;
if(!duration || !sec) return true;
var sec=duration-sec;
self.__private__.config.timerFunc({sec:sec,dur:duration,index:self.__private__.index});
return true;
}); 
this.on(EVENTS.AdSkipped, function AdSkipped(args) {
});


this.on(EVENTS.AdClickThru, function onAdClickThru(url, id, playerHandles) {
      //console.log(["11 или несколько "+this.__private__.index]);
	  if(this.__private__.index == -1) {
	  //console.log([5552,this.isPaused]);
	  //alert(this.__private__.player.video.style.opacity);
	  if(iOS()){
	  
	  if(typeof this.isPaused !='undefined' && this.isPaused){
	  this.isPaused=0;
	  this.resumeAd(); 
	  }else{
	  this.isPaused=1;
	  this.pauseAd();
	  }
	  }
	  return false; //не волк
	  }
	  if(!self.vast) return;
       var clickThrough = url || self.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
        if (playerHandles && clickThrough) {
            window.open(clickThrough);
        }
    });
};
inherits(VASTPlayer, EventEmitter);
Object.defineProperties(VASTPlayer.prototype, {
    container: {
        get: function getContainer() {
            return this.__private__.container;
        }
    },

    config: {
        get: function getConfig() {
            return this.__private__.config;
        }
    },

    vast: {
        get: function getVast() {
            return this.__private__.vast;
        }
    },

    ready: {
        get: function getReady() {
            return this.__private__.ready;
        }
    },

    adRemainingTime: proxyProp('adRemainingTime'),
    adDuration: proxyProp('adDuration'),
    adVolume: proxyProp('adVolume')
});
VASTPlayer.prototype.PlayMp4 = function PlayMp4(config) {
var self = this;
if( iOS()){
var player = new IOSVideoPlayer(self.container);

}else{
 var player = new HTMLVideoPlayer(self.container);
}


          var proxy = new EventProxy(EVENTS);
 		  proxy.from(player).to(self);
                  self.__private__.player = player;
		  self.__private__.index = -1;
		   
  		 return player.load(config.mediafiles, {}).then(function setupPixels() {
		 self.__private__.ready = true;
		 //self.__private__.player.video.autoplay=true;
		 self.__private__.player.video.controls=true;
		 
		  self.emit('ready');
		  //self.startAd();
		
		
        
        return self;
		}).catch(function emitError(reason) {
		  self.emit('error', reason);
		  throw reason;
	   });
};
VASTPlayer.prototype.preparePlay = function preparePlay(config) {
         var self = this; 
		
         var proxy = new EventProxy(EVENTS);
		 proxy.from(self.__private__.player).to(self);
		 		
		
		 return self.__private__.player.load(self._mediaFiles, self._parameters).then(function setupPixels() {
		   
	     self._reporter.track(self.__private__.player); 
		 self.__private__.ready = true;
		
         self.emit('ready');
		 
         return self;
		}).catch(function emitError(reason) { 
		   self.emit('error', reason);
		   throw reason; 
	   });
     
};

VASTPlayer.prototype.loadNew = function loadNew(uri) {
    var self = this;
    var config = this.config.vast;
    function checkIfFlashEnabled() {
    var isFlashEnabled = false;
    if (typeof(navigator.plugins) != "undefined" && typeof(navigator.plugins["Shockwave Flash"]) == "object") isFlashEnabled = true;
    else if (typeof  window.ActiveXObject != "undefined") {
        // Проверка для IE
        try {
            if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) isFlashEnabled = true;
        } catch (e) {
        }
    }
     return isFlashEnabled;
    };

 //console.log([8222133,window.MPOverControl]);
    return VAST.fetch(uri, config).then(function loadPlayer(vast) {
 //var myfiles = vast.filter('ads[0].creatives[0].mediaFiles', function() { return true; });
 
  
	   var myIos=iOS();
        var config = (function() {
            var jsVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                return (
                    mediaFile.type === MIME.JAVASCRIPT ||
                    mediaFile.type === 'application/x-javascript'
                ) && mediaFile.apiFramework === 'VPAID';
            });
            var swfVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
			        return mediaFile.type === MIME.FLASH && mediaFile.apiFramework === 'VPAID' && checkIfFlashEnabled();
            });
            var files = vast.filter('ads[0].creatives[0].mediaFiles', function() { return true; });
			
			
            if (jsVPAIDFiles.length > 0) {
			self.__private__.pType=1;
                return {
                    player: new JavaScriptVPAIDPlayer(self.container),
                    mediaFiles: jsVPAIDFiles
                };
            } else if (!myIos &&  swfVPAIDFiles.length > 0) {
			  self.__private__.pType=2;
                return {
                    player: new FlashVPAIDPlayer(self.container, VASTPlayer.vpaidSWFLocation),
                    mediaFiles: swfVPAIDFiles
                };
            }
			if(myIos){
			self.__private__.pType=3;
            return {
			
			    player: new IOSVideoPlayer(self.container),
                mediaFiles: files
            };
			}else{
			self.__private__.pType=3;
			   return {
                player: new HTMLVideoPlayer(self.container),
                mediaFiles: files
            };
			}
        }());
	
        var parameters = vast.get('ads[0].creatives[0].parameters');
		
		var pixels = [].concat(
            vast.map('ads[0].impressions', function(impression) {
                return { event: 'impression', uri: impression.uri.replace(/^\s+|\s+$/,'') };
            }),
            vast.map('ads[0].errors', function(uri) {
                return { event: 'error', uri: uri.replace(/^\s+|\s+$/,'') };
            }),
            vast.get('ads[0].creatives[0].trackingEvents'),
            vast.map('ads[0].creatives[0].videoClicks.clickTrackings', function(uri) {
                return { event: 'clickThrough', uri: uri.replace(/^\s+|\s+$/,'') };
            })
        );
		if(!config || !config.player)
		throw "no config of player";  
        var player = config.player;
         var reporter = new PixelReporter(pixels, self.config.tracking.mapper);
		 self.__private__.vast = vast;
		 self.__private__.index = self.linkIndex;
         self.__private__.player = config.player;
		 self._reporter=reporter;
		 self._mediaFiles=config.mediaFiles;
		 self._parameters=parameters;
 		//var res={reporter:reporter,vast:vast,player:player,mediaFiles:mediaFiles,parameters:parameters,playType:self.__private__.pType};
		return true;
    }).catch(function emitError(reason) {
	    self.emit('error', reason);
		throw reason;
    });
	
};   
VASTPlayer.prototype.startAd = proxy('startAd');

VASTPlayer.prototype.stopAd = proxy('stopAd');

VASTPlayer.prototype.pauseAd = proxy('pauseAd');

VASTPlayer.prototype.resumeAd = proxy('resumeAd');

//VASTPlayer.prototype.skipAd = proxy('skipAd');


VASTPlayer.vpaidSWFLocation = 'https://cdn.jsdelivr.net' +
    '/vast-player/0.2.9/vast-player--vpaid.swf';

module.exports = VASTPlayer;

},{"./EventProxy":25,"./PixelReporter":27,"./enums/MIME":32,"./enums/VPAID_EVENTS":33,"./players/FlashVPAID":35,"./players/HTMLVideo":36,"./players/IOSVideo":37,"./players/JavaScriptVPAID":38,"events":7,"lie":9,"util":23,"vastacular":42}],29:[function(require,module,exports){
'use strict';

function VPAIDVersion(versionString) {
    var parts = versionString.split('.').map(parseFloat);

    this.string = versionString;

    this.major = parts[0];
    this.minor = parts[1];
    this.patch = parts[2];

    Object.freeze(this);
}

VPAIDVersion.prototype.toString = function toString() {
    return this.string;
};

module.exports = VPAIDVersion;

},{}],30:[function(require,module,exports){
'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var EVENTS = require('./enums/VPAID_EVENTS');

function fire(event, tracker) {
    
    if (tracker.fired[event]) { return; }
    //console.log('event:',event);
    tracker.emit(event);
    tracker.fired[event] = true;
}

function VideoTracker(duration) {
    EventEmitter.apply(this, arguments); // call super()

    this.duration = duration;
    this.seconds = Array.apply([], new Array(duration)).map(function() { return false; });

    this.fired = [
        EVENTS.AdVideoStart,
        EVENTS.AdVideoFirstQuartile,
        EVENTS.AdVideoMidpoint,
        EVENTS.AdVideoThirdQuartile,
        EVENTS.AdVideoComplete
    ].reduce(function(fired, event) {
        fired[event] = false;
        return fired;
    }, {});
}
inherits(VideoTracker, EventEmitter);

VideoTracker.prototype.tick = function tick() {
    var seconds = this.seconds;
    var state = this._getState();
	
     var index = Math.round(state.currentTime) - 1;
	// console.log('tick',state);
	 if(index>-1)
	 this.emit(EVENTS.AdRemainingTimeChange,{sec:index,dur:this.duration});

    var quartileIndices = [1, 2, 3, 4].map(function(quartile) {
        return Math.floor(this.duration / 4  * quartile);
    }, this);
     
    function quartileViewed(quartile) {
        var end = quartileIndices[quartile - 1];

        return seconds.slice(0, end).every(function(second) {
            return second === true;
        });
    }
   
    if (state.playing) {
	    fire(EVENTS.AdVideoStart, this);

        if (index > -1) {
            this.seconds[index] = true;
        }
    }

    if (quartileViewed(1)) {
        fire(EVENTS.AdVideoFirstQuartile, this);
    }

    if (quartileViewed(2)) {
        fire(EVENTS.AdVideoMidpoint, this);
    }

    if (quartileViewed(3)) {
        fire(EVENTS.AdVideoThirdQuartile, this);
    }

    if (quartileViewed(4)) {
        fire(EVENTS.AdVideoComplete, this);
    }
};

module.exports = VideoTracker;

},{"./enums/VPAID_EVENTS":33,"events":7,"util":23}],31:[function(require,module,exports){
'use strict';

var HTML_MEDIA_EVENTS = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'encrypted',
    'ended',
    'error',
    'interruptbegin',
    'interruptend',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'mozaudioavailable',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting'
];

HTML_MEDIA_EVENTS.forEach(function(event) {
    this[event.toUpperCase()] = event;
}, HTML_MEDIA_EVENTS);

Object.freeze(HTML_MEDIA_EVENTS);

module.exports = HTML_MEDIA_EVENTS;

},{}],32:[function(require,module,exports){
var MIME = {
    JAVASCRIPT: 'application/javascript',
    FLASH: 'application/x-shockwave-flash'
};

Object.freeze(MIME);

module.exports = MIME;

},{}],33:[function(require,module,exports){
'use strict';

var VPAID_EVENTS = [
    'AdLoaded',
    'AdStarted',
    'AdStopped',
    'AdSkipped',
    'AdSkippableStateChange',
    'AdSizeChange',
    'AdLinearChange',
    'AdDurationChange',
    'AdExpandedChange',
    'AdRemainingTimeChange',
    'AdVolumeChange',
    'AdImpression',
    'AdVideoStart',
    'AdVideoFirstQuartile',
    'AdVideoMidpoint',
    'AdVideoThirdQuartile',
    'AdVideoComplete',
    'AdClickThru',
    'AdInteraction',
    'AdUserAcceptInvitation',
    'AdUserMinimize',
    'AdUserClose',
    'AdPaused',
    'AdPlaying',
    'AdLog',
    'AdError'
];

VPAID_EVENTS.forEach(function(event) {
    VPAID_EVENTS[event] = event;
});

Object.freeze(VPAID_EVENTS);

module.exports = VPAID_EVENTS;

},{}],34:[function(require,module,exports){
'use strict';

var win = require('./window');
var video = document.createElement('video');
var MIME = require('./enums/MIME');

exports.isDesktop = !/Android|Silk|Mobile|PlayBook/.test(win.navigator.userAgent);

exports.canPlay = function canPlay(type) {
    var mimeTypes = win.navigator.mimeTypes;
    var ActiveXObject = win.ActiveXObject;

    switch (type) {
    case MIME.FLASH:
        try {
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash') ? 2 : 0;
        } catch (e) {
            return !!(mimeTypes && mimeTypes[MIME.FLASH]) ? 2 : 0;
        }
        return 0;
    case MIME.JAVASCRIPT:
    case 'application/x-javascript':
        return 2;
    default:
        if (video.canPlayType) {
            switch (video.canPlayType(type)) {
            case 'probably':
                return 2;
            case 'maybe':
                return 1;
            default:
                return 0;
            }
        }
    }

    return 0;
};

Object.freeze(exports);

},{"./enums/MIME":32,"./window":41}],35:[function(require,module,exports){
'use strict';

var VPAID = require('./VPAID');
var inherits = require('util').inherits;
var LiePromise = require('lie');
var uuid = require('../uuid');
var querystring = require('querystring');
var EVENTS = require('../enums/VPAID_EVENTS');
var VPAIDVersion = require('../VPAIDVersion');

function FlashVPAID(container, swfURI) {
    VPAID.apply(this, arguments);  // call super()
    
    this.swfURI = swfURI;
    this.object = null;
}
inherits(FlashVPAID, VPAID);

FlashVPAID.prototype.load = function load(mediaFiles, parameters) {
    var self = this;
    var uri = mediaFiles[0].uri;
    var bitrate = mediaFiles[0].bitrate;

    return new LiePromise(function loadCreative(resolve, reject) {
	
        var vpaid = document.createElement('object');
        var eventFnName = 'vast_player__' + uuid(20);
        var flashvars = querystring.stringify({
            vpaidURI: uri,
            eventCallback: eventFnName
        });
		
        function cleanup(reason) {
            self.container.removeChild(vpaid);
            self.api = null;
            self.object = null;
            delete window[eventFnName];

            if (reason) {
                reject(reason);
            }
        }
        vpaid.type = 'application/x-shockwave-flash';
        vpaid.data = self.swfURI + '?' + flashvars;
        vpaid.style.display = 'block';
        vpaid.style.width = '100%';
        vpaid.style.height = '100%';
        vpaid.style.border = 'none';
        vpaid.style.opacity = '0';
        vpaid.innerHTML = [
            '<param name="movie" value="' + self.swfURI + '">',
            '<param name="flashvars" value="' + flashvars + '">',
            '<param name="quality" value="high">',
            '<param name="play" value="false">',
            '<param name="loop" value="false">',
            '<param name="wmode" value="opaque">',
            '<param name="scale" value="noscale">',
            '<param name="salign" value="lt">',
            '<param name="allowScriptAccess" value="always">'
        ].join('\n');

        self.object = vpaid;
		//console.log([225,eventFnName]);
         window[eventFnName] = function handleVPAIDEvent(event) {
		 //console.log([227,event]);
            switch (event.type) {
            case EVENTS.AdClickThru:
                return self.emit(event.type, event.url, event.Id, event.playerHandles);
            case EVENTS.AdInteraction:
            case EVENTS.AdLog:
                return self.emit(event.type, event.Id);
            case EVENTS.AdError:
                return self.emit(event.type, event.message);
            default:
                return self.emit(event.type);
            }
        };
        self.once('VPAIDInterfaceReady', function initAd() {
            var position = vpaid.getBoundingClientRect();
            var version = self.vpaidVersion = new VPAIDVersion(vpaid.handshakeVersion('2.0'));

            if (version.major > 2) {
                return reject(new Error('VPAID version ' + version + ' is not supported.'));
            }

            self.on('VPAIDInterfaceResize', function resizeAd() {
                var position = vpaid.getBoundingClientRect();

                self.resizeAd(position.width, position.height, 'normal');
            });

            vpaid.initAd(position.width, position.height, 'normal', bitrate, parameters, null);
        });

        self.once(EVENTS.AdLoaded, function handleAdLoaded() {
            self.api = vpaid;
            vpaid.style.opacity = '1';

            resolve(self);
        });

        self.once(EVENTS.AdError, function handleAdError(reason) {
		     cleanup(new Error(reason));
        });

        self.once(EVENTS.AdStopped, cleanup);
console.log([226,vpaid]);
        self.container.appendChild(vpaid);
    });
};

module.exports = FlashVPAID;

},{"../VPAIDVersion":29,"../enums/VPAID_EVENTS":33,"../uuid":40,"./VPAID":39,"lie":9,"querystring":14,"util":23}],36:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var LiePromise = require('lie');
var canPlay = require('../environment').canPlay;
var sortBy = require('sort-by');
var VPAID_EVENTS = require('../enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../enums/HTML_MEDIA_EVENTS');
var HTMLVideoTracker = require('../HTMLVideoTracker');
var EventProxy = require('../EventProxy');
function simulateClick() {
  var event = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var cb = document.getElementById('container'); 
  var canceled = !cb.dispatchEvent(event);
  if (canceled) {
    // A handler called preventDefault.
   // alert("canceled");
  } else {
    // None of the handlers called preventDefault.
    //alert("not canceled");
  }
}
function on(video, event, handler) {
    return video.addEventListener(event, handler, false);
}

function off(video, event, handler) {
    return video.removeEventListener(event, handler, false);
}

function once(video, event, handler) {
    return on(video, event, function onevent() {
        off(video, event, onevent);
        return handler.apply(this, arguments);
    });
}

function method(implementation, promiseify) {
    function getError() {
        return new Error('The <video> has not been loaded.');
    }

    return function callImplementation(/*...args*/) {
        if (!this.video) {
            if (promiseify) { return LiePromise.reject(getError()); } else { throw getError(); }
        }

        return implementation.apply(this, arguments);
    };
}

function pickMediaFile(mediaFiles, dimensions) {
    var width = dimensions.width;
    var items = mediaFiles.map(function(mediaFile) {
        return {
            mediaFile: mediaFile,
            playability: canPlay(mediaFile.type)
        };
    }).filter(function(config) {
        return config.playability > 0;
    }).sort(sortBy('-playability', '-mediaFile.bitrate'));
    var distances = items.map(function(item) {
        return Math.abs(width - item.mediaFile.width);
    });
    var item = items[distances.indexOf(Math.min.apply(Math, distances))];

    return (!item || item.playability < 1) ? null : item.mediaFile;
}

function HTMLVideo(container) {
    this.container = container;
    this.video = null;

    this.__private__ = {
        hasPlayed: false
    };
}
inherits(HTMLVideo, EventEmitter);
Object.defineProperties(HTMLVideo.prototype, {
    adRemainingTime: { get: method(function getAdRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }) },
    adDuration: { get: method(function getAdDuration() { return this.video.duration; }) },
    adVolume: {
        get: method(function getAdVolume() { return this.video.volume; }),
        set: method(function setAdVolume(volume) { this.video.volume = volume; })
    }
});

HTMLVideo.prototype.load = function load(mediaFiles) {
    var self = this;

    return new LiePromise(function loadCreative(resolve, reject) {
        var video = document.createElement('video');
        var mediaFile = pickMediaFile(mediaFiles, self.container.getBoundingClientRect());

        if (!mediaFile) {
            return reject(new Error('There are no playable <MediaFile>s.'));
        }

        video.setAttribute('webkit-playsinline', true);
        video.src = mediaFile.uri;
        video.preload = 'auto';

        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
//if(/Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent)){
 //video.setAttribute("autoplay",true);
 //video.setAttribute("loop",true);
 //video.setAttribute("muted",true);
 
 //video.autoplay=true;
 //video.loop=true;
 //video.muted=true;
// }
        once(video, HTML_MEDIA_EVENTS.LOADEDMETADATA, function onloadedmetadata() {
		
            var tracker = new HTMLVideoTracker(video);
            var proxy = new EventProxy(VPAID_EVENTS);

            proxy.from(tracker).to(self);

            self.video = video;
            resolve(self);

            self.emit(VPAID_EVENTS.AdLoaded);

            on(video, HTML_MEDIA_EVENTS.DURATIONCHANGE, function ondurationchange() {

                self.emit(VPAID_EVENTS.AdDurationChange);
            });
            on(video, HTML_MEDIA_EVENTS.VOLUMECHANGE, function onvolumechange() {

                self.emit(VPAID_EVENTS.AdVolumeChange);
            });
        });

        once(video, HTML_MEDIA_EVENTS.ERROR, function onerror() {

            var error = video.error;

            self.emit(VPAID_EVENTS.AdError, error.message);
            reject(error);
        });

        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
				
            self.__private__.hasPlayed = true;
            self.emit(VPAID_EVENTS.AdImpression);
        });

        once(video, HTML_MEDIA_EVENTS.ENDED, function onended() {
            self.stopAd();
        });

        on(video, 'click', function onclick() {
            self.emit(VPAID_EVENTS.AdClickThru, null, null, true);
        });

        self.container.appendChild(video);
    });
};

HTMLVideo.prototype.startAd = method(function startAd() {

    var self = this;
    var video = this.video;

	
    if (this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has already been started.'));
    }
    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdStarted);
        });
		
 if(1==0 && /Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent)){

 simulateClick();
 return false;
 }
        return video.play();
    });
}, true);

HTMLVideo.prototype.stopAd = method(function stopAd() {
    this.container.removeChild(this.video);
    this.emit(VPAID_EVENTS.AdStopped);

    return LiePromise.resolve(this);
}, true);

HTMLVideo.prototype.pauseAd = method(function pauseAd() {
    var self = this;
    var video = this.video;

    if (this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPause(resolve) {
        once(video, HTML_MEDIA_EVENTS.PAUSE, function onpause() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPaused);
        });

        return video.pause();
    });
}, true);

HTMLVideo.prototype.resumeAd = method(function resumeAd() {
    var self = this;
    var video = this.video;

    if (!this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has not been started yet.'));
    }

    if (!this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAY, function onplay() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPlaying);
        });

        return video.play();
    });
}, true);

module.exports = HTMLVideo;

},{"../EventProxy":25,"../HTMLVideoTracker":26,"../enums/HTML_MEDIA_EVENTS":31,"../enums/VPAID_EVENTS":33,"../environment":34,"events":7,"lie":9,"sort-by":16,"util":23}],37:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var LiePromise = require('lie');
var canPlay = require('../environment').canPlay;
var sortBy = require('sort-by');
var VPAID_EVENTS = require('../enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../enums/HTML_MEDIA_EVENTS');
var HTMLVideoTracker = require('../HTMLVideoTracker');
var EventProxy = require('../EventProxy');

function on(video, event, handler) {
    return video.addEventListener(event, handler, false);
}

function off(video, event, handler) {
    return video.removeEventListener(event, handler, false);
}

function once(video, event, handler) {
    return on(video, event, function onevent() {
        off(video, event, onevent);
        return handler.apply(this, arguments);
    });
}

function method(implementation, promiseify) {
    function getError() {
        return new Error('The <video> has not been loaded.');
    }

    return function callImplementation(/*...args*/) {
        if (!this.video) {
            if (promiseify) { return LiePromise.reject(getError()); } else { throw getError(); }
        }

        return implementation.apply(this, arguments);
    };
}

function pickMediaFile(mediaFiles, dimensions) {
    var width = dimensions.width;
    var items = mediaFiles.map(function(mediaFile) {
        return {
            mediaFile: mediaFile,
            playability: canPlay(mediaFile.type)
        };
    }).filter(function(config) {
        return config.playability > 0;
    }).sort(sortBy('-playability', '-mediaFile.bitrate'));
    var distances = items.map(function(item) {
        return Math.abs(width - item.mediaFile.width);
    });
    var item = items[distances.indexOf(Math.min.apply(Math, distances))];

    return (!item || item.playability < 1) ? null : item.mediaFile;
}

function IOSVideo(container) {
    this.container = container;
    this.video = null;

    this.__private__ = {
        hasPlayed: false
    };
};
inherits(IOSVideo, EventEmitter);
Object.defineProperties(IOSVideo.prototype, {
    adRemainingTime: { get: method(function getAdRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }) },
    adDuration: { get: method(function getAdDuration() { return this.video.duration; }) },
    adVolume: {
        get: method(function getAdVolume() { return this.video.volume; }),
        set: method(function setAdVolume(volume) { this.video.volume = volume; })
    }
});

IOSVideo.prototype.load = function load(mediaFiles) {
    var self = this;

    return new LiePromise(function loadCreative(resolve, reject) {
        var video = document.createElement('video');
		
        var mediaFile = pickMediaFile(mediaFiles, self.container.getBoundingClientRect());

        if (!mediaFile) {
            return reject(new Error('There are no playable <MediaFile>s.'));
        }
 
		video.setAttribute('muted',true);
		//video.setAttribute('autoplay',true);
		video.setAttribute('playsinline',true);
		
		
        video.setAttribute('webkit-playsinline', true);
        video.src = mediaFile.uri;
        video.preload = 'auto';

        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';

        once(video, HTML_MEDIA_EVENTS.LOADEDMETADATA, function onloadedmetadata() {
		
            var tracker = new HTMLVideoTracker(video);
            var proxy = new EventProxy(VPAID_EVENTS);

            proxy.from(tracker).to(self);

            self.video = video;
            resolve(self);

            self.emit(VPAID_EVENTS.AdLoaded);

            on(video, HTML_MEDIA_EVENTS.DURATIONCHANGE, function ondurationchange() {

                self.emit(VPAID_EVENTS.AdDurationChange);
            });
            on(video, HTML_MEDIA_EVENTS.VOLUMECHANGE, function onvolumechange() {

                self.emit(VPAID_EVENTS.AdVolumeChange);
            });
        });

        once(video, HTML_MEDIA_EVENTS.ERROR, function onerror() {

            var error = video.error;

            self.emit(VPAID_EVENTS.AdError, error.message);
            reject(error);
        });

        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
		    //alert('play');
            self.__private__.hasPlayed = true;
			//console.log(2231231774);
            self.emit(VPAID_EVENTS.AdImpression);
			//console.log(2231231774);
        });

        once(video, HTML_MEDIA_EVENTS.ENDED, function onended() {
		//alert('stop');
            self.stopAd();
        });

        on(video, 'click', function onclick() {
            self.emit(VPAID_EVENTS.AdClickThru, null, null, true);
        });

        self.container.appendChild(video);
    });
};

IOSVideo.prototype.startAd = method(function startAd() {

    var self = this;
    var video = this.video;
	/*
	function debugEvents(video) {
	[
		'loadstart',
		'progress',
		'suspend',
		'abort',
		'error',
		'emptied',
		'stalled',
		'loadedmetadata',
		'loadeddata',
		'canplay',
		'canplaythrough',
		'playing', // fake event
		'waiting',
		'seeking',
		'seeked',
		'ended',
	//  'durationchange',
		'timeupdate',
		'play', // fake event
		'pause', // fake event
	// 'ratechange',
	// 'resize',
	// 'volumechange',
		'webkitbeginfullscreen',
		'webkitendfullscreen',
	].forEach(function (event) {
		//video.addEventListener(event, function () {
			//console.info('@', event);
		//});
	});
}
*/
   // video.addEventListener('ended', function () {
	
	
	//		 self.stopAd();
	//});
    //video.addEventListener('playing', function () {
	        //resolve(self);
			//self.__private__.hasPlayed = false;
			//self.emit(VPAID_EVENTS.AdStarted);
	//});
	
	//window.enableInlineVideo(video, {everywhere: true});
	//alert('entry');
	
	//return null;
    //return video.play();
	//alert(this.__private__.hasPlayed);
    if (this.__private__.hasPlayed) {
	    //alert("играл почём зря"); 
        return LiePromise.reject(new Error('The ad has already been started.'));
    }
	
    return new LiePromise(function callPlay(resolve) {

	
        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
           // alert('once');
            resolve(self);
            self.emit(VPAID_EVENTS.AdStarted);
        });
		

		window.enableInlineVideo(video, {everywhere: true});
        return video.play();
    });
	
}, true);

IOSVideo.prototype.stopAd = method(function stopAd() {
    
   //this.container.removeChild(this.video); 
   //alert(this.container.innerHTML);
  
   this.emit(VPAID_EVENTS.AdStopped);
    //alert('переход');
    //this.__private__.hasPlayed = false; 
    return LiePromise.resolve(this);
}, true);

IOSVideo.prototype.pauseAd = method(function pauseAd() {
    var self = this;
    var video = this.video;

    if (this.video.paused) {
        return LiePromise.resolve(this);
    }
    
	video.className="";
    return new LiePromise(function callPause(resolve) {
        once(video, HTML_MEDIA_EVENTS.PAUSE, function onpause() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPaused);
        });

        return video.pause();
    });
}, true);

IOSVideo.prototype.resumeAd = method(function resumeAd() {
    var self = this;
    var video = this.video;

    if (!this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has not been started yet.'));
    }
    video.className="IIV";
    if (!this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAY, function onplay() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPlaying);
        });

        return video.play();
    });
}, true);

module.exports = IOSVideo;

},{"../EventProxy":25,"../HTMLVideoTracker":26,"../enums/HTML_MEDIA_EVENTS":31,"../enums/VPAID_EVENTS":33,"../environment":34,"events":7,"lie":9,"sort-by":16,"util":23}],38:[function(require,module,exports){
'use strict';

var inherits = require('util').inherits;
var VPAID = require('./VPAID');
var LiePromise = require('lie');
var EVENTS = require('../enums/VPAID_EVENTS');
var isDesktop = require('../environment').isDesktop;
var VPAIDVersion = require('../VPAIDVersion');

function JavaScriptVPAID() {
    VPAID.apply(this, arguments); // call super()
    this.frame = null;
	this.playDelay=1;
}
inherits(JavaScriptVPAID, VPAID);

JavaScriptVPAID.prototype.load = function load(mediaFiles, parameters) {
    var self = this;
    var uri = mediaFiles[0].uri;
    var bitrate = mediaFiles[0].bitrate;

    return new LiePromise(function loadCreative(resolve, reject) {
        var iframe = document.createElement('iframe');
		
        var script = document.createElement('script');
        var video = document.createElement('video');
        iframe.scrolling="no";
        function cleanup(reason) {
		
		    //console.log([123321,'iframe стоп']);
		    try{
		    self.container.removeChild(iframe);
			}catch(e){
			//return;
			//console.log([123321,'iframe отложен']);
			}
			//console.log([12332122,reason]);
            self.frame = null;
			//console.log([12332133,reason]);
            self.api = null;
			//console.log([12332144,reject]);
			//console.log([123321,reject]);
			//reject(1);
			//throw reason;
			//return;
			//console.log([97777,reason.type]);
            if (reason) {
                reject(reason);
            }
        }
        function setCheckLoadedTime(cnt){
		if(!self.playDelay) return;
		console.log([123,cnt,self.playDelay,"log vpaid"]);
		if(cnt>0){
		setTimeout(function(){
		setCheckLoadedTime((cnt-1))
		}, 1000);
		return;
		}
		cleanup(new Error("vpaid не загрузился в течении 7 сек"));  
		}
		setCheckLoadedTime(7);
		
        iframe.src = 'about:blank';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.style.opacity = '0';
        iframe.style.border = 'none';

        video.setAttribute('webkit-playsinline', 'true');
        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';

        self.container.appendChild(iframe);
        // Opening the iframe document for writing causes it to inherit its parent's location
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.close();

        iframe.contentWindow.document.body.style.margin = '0';
        self.frame = iframe;

        script.src = uri;
        script.onload = onload3;
		function onload3(obj,control_counter) { 
		   control_counter= control_counter || 3;
		   if(control_counter<=0) return;
		   
		   var d_tmp=iframe.contentWindow;
		   var flag=0;
		   if(d_tmp && typeof d_tmp.getVPAIDAd=='function'){
		   
			 
			}else{
			throw 'но плеер';
			setTimeout(
			function(){
			onload3(obj,(control_counter-1))
			}
			,200); 
			return;
			}
			
            var vpaid = iframe.contentWindow.getVPAIDAd();
            var position = iframe.getBoundingClientRect();
            var slot = iframe.contentWindow.document.body;
            var version = self.vpaidVersion = new VPAIDVersion(vpaid.handshakeVersion('2.0'));

            function resizeAd() {
                var position = iframe.getBoundingClientRect();

                self.resizeAd(position.width, position.height, 'normal');
            }

            if (version.major > 2) {
                return reject(new Error('VPAID version ' + version + ' is not supported.'));
            }

            iframe.contentWindow.addEventListener('resize', resizeAd, false);

            EVENTS.forEach(function subscribe(event) {
                return vpaid.subscribe(function handle(/*...args*/) {
                    var args = new Array(arguments.length);
					
                    var length = arguments.length;var rl=length;
                    while (length--) { args[length] = arguments[length]; }
					//console.log([44110,'vpaid',[event].concat(args)]); 
                    return self.emit.apply(self, [event].concat(args));
                }, event);
            });
            self.once(EVENTS.AdLoaded, function onAdLoaded() {
			    self.playDelay=0;
			    iframe.style.opacity = '1';
                self.api = vpaid;
                resolve(self);
            });

            self.once(EVENTS.AdError, function onAdError(reason) {
			   //console.log([977777,reason]);
			    cleanup(new Error(reason));
            });

            self.once(EVENTS.AdStopped, cleanup);
            vpaid.initAd(
                position.width,
                position.height,
                'normal',
                bitrate,
                { AdParameters: parameters },
                { slot: slot, videoSlot: video, videoSlotCanAutoPlay: true }
            );
			//console.log([318565,'инит']);
        };
        script.onerror = function onerror() {
            cleanup(new Error('Failed to load MediaFile [' + uri + '].'));
        };
         var style = document.createElement("style");
		 style.innerHTML='.advark-video {top:0} \n';
		 style.innerHTML+='.advark-controls	.advark-controls div.advark-vpaid {    position: absolute;    pointer-events: none;    top: 0;    z-index: 32000;} \n';
		style.id="prev_div_134"; 
        iframe.contentWindow.document.body.appendChild(video);
        iframe.contentWindow.document.head.appendChild(script);
		iframe.contentWindow.document.head.appendChild(style);
    });
};

module.exports = JavaScriptVPAID;

},{"../VPAIDVersion":29,"../enums/VPAID_EVENTS":33,"../environment":34,"./VPAID":39,"lie":9,"util":23}],39:[function(require,module,exports){
'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var EVENTS = require('../enums/VPAID_EVENTS');

function proxy(method, event) {

    return function callMethod(/*..args*/) {
        var args = arguments;
        var api = this.api;
        var self = this;

        function getError() {
            return new Error('Ad has not been loaded.');
        }

        function call() {
		   //console.log(['method',method]);
		   //console.log(['method',method,typeof api[method]]);
		    if(typeof api[method]!="undefined"){
			 //console.log(['method',method,api[method]]);
			}
            return api[method].apply(api, args);
			
        }

        if (!event) {
            if (!api) {
                throw getError();
            }

            return call();
        }

        return new LiePromise(function(resolve, reject) {
            if (!api) {
                return reject(getError());
            }

            self.once(event, function done() {
                resolve(self);
            });

            return call();
        });
    };
}

function VPAID(container) {
    this.container = container;
    this.api = null;
    this.vpaidVersion = null;
}
inherits(VPAID, EventEmitter);
Object.defineProperties(VPAID.prototype, {
    adLinear: { get: proxy('getAdLinear') },
    adWidth: { get: proxy('getAdWidth') },
    adHeight: { get: proxy('getAdHeight') },
    adExpanded: { get: proxy('getAdExpanded') },
    adSkippableState: { get: proxy('getAdSkippableState') },
    adRemainingTime: { get: proxy('getAdRemainingTime') },
    adDuration: { get: proxy('getAdDuration') },
    adVolume: { get: proxy('getAdVolume'), set: proxy('setAdVolume') },
    adCompanions: { get: proxy('getAdCompanions') },
    adIcons: { get: proxy('getAdIcons') }
});

VPAID.prototype.load = function load() {
    throw new Error('VPAID subclass must implement load() method.');
};

VPAID.prototype.resizeAd = proxy('resizeAd', EVENTS.AdSizeChange);

VPAID.prototype.startAd = proxy('startAd', EVENTS.AdStarted);

VPAID.prototype.stopAd = proxy('stopAd', EVENTS.AdStopped);

VPAID.prototype.pauseAd = proxy('pauseAd', EVENTS.AdPaused);

VPAID.prototype.resumeAd = proxy('resumeAd', EVENTS.AdPlaying);

VPAID.prototype.expandAd = proxy('expandAd', EVENTS.AdExpandedChange);

VPAID.prototype.collapseAd = proxy('collapseAd', EVENTS.AdExpandedChange);

VPAID.prototype.skipAd = proxy('skipAd', EVENTS.AdSkipped);

module.exports = VPAID;

},{"../enums/VPAID_EVENTS":33,"events":7,"lie":9,"util":23}],40:[function(require,module,exports){
'use strict';

var POSSIBILITIES = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var POSSIBILITIES_LENGTH = POSSIBILITIES.length;

module.exports = function uuid(length) {
    var result = '';

    while (length--) {
        result += POSSIBILITIES.charAt(Math.floor(Math.random() * POSSIBILITIES_LENGTH));
    }

    return result;
};

},{}],41:[function(require,module,exports){
module.exports = window;

},{}],42:[function(require,module,exports){
exports.VAST = require('./lib/VAST');

},{"./lib/VAST":43}],43:[function(require,module,exports){
'use strict';

var LiePromise = require('lie');
var request = require('superagent');
var copy = require('./utils/copy');
var defaults = require('./utils/defaults');
var extend = require('./utils/extend');
var nodeifyPromise = require('./utils/nodeify_promise');
var push = Array.prototype.push;
var xmlFromVast = require('./xml_from_vast');

var adDefaults = {
    inline: inline,
    wrapper: wrapper
};

var inlineDefaults = {
    linear: linear,
    companions: companions,
    nonLinear: nonLinear
};

function noop() {}

function inline(ad) {
    defaults({
        description: null,
        survey: null
    }, ad);
}

function wrapper() {}

function linear(creative) {
    defaults({
        trackingEvents: [],
        parameters: null,
        videoClicks: null
    }, creative);

    (creative.mediaFiles || []).forEach(function(mediaFile) {
        defaults({
            id: null,
            bitrate: null,
            scalable: null,
            maintainAspectRatio: null,
            apiFramework: null
        }, mediaFile);
    });
}

function companions(creative) {
    creative.companions.forEach(function(companion) {
        defaults({
            expandedWidth: null,
            expandedHeight: null,
            apiFramework: null,
            trackingEvents: [],
            clickThrough: null,
            altText: null,
            parameters: null
        }, companion);
    });
}

function nonLinear(creative) {
    defaults({
        trackingEvents: []
    }, creative);

    creative.ads.forEach(function(ad) {
        defaults({
            id: null,
            expandedWidth: null,
            expandedHeight: null,
            scalable: null,
            maintainAspectRatio: null,
            minSuggestedDuration: null,
            apiFramework: null,
            clickThrough: null,
            parameters: null
        }, ad);
    });
}

function VAST(json) {
    copy(json, this, true);

    this.ads.forEach(function(ad) {
        defaults({
            system: { version: null },
            errors: []
        }, ad);

        ad.creatives.forEach(function(creative) {
            defaults({
                id: null,
                sequence: null,
                adID: null
            }, creative);

            inlineDefaults[creative.type](creative);
        });

        adDefaults[ad.type](ad);
    });

    this.__private__ = { wrappers: [], inlines: [] };
}

Object.defineProperties(VAST.prototype, {
    wrappers: {
        get: function getWrappers() {
            var wrappers = this.__private__.wrappers;

            wrappers.length = 0;
            push.apply(wrappers, this.filter('ads', function(ad) {
                return ad.type === 'wrapper';
            }));

            return wrappers;
        }
    },

    inlines: {
        get: function getInlines() {
            var inlines = this.__private__.inlines;

            inlines.length = 0;
            push.apply(inlines, this.filter('ads', function(ad) {
                return ad.type === 'inline';
            }));

            return inlines;
        }
    }
});

VAST.prototype.get = function get(prop) {
    var parts = (prop || '').match(/[^\[\]\.]+/g) || [];

    return parts.reduce(function(result, part) {
        return (result || undefined) && result[part];
    }, this);
};

VAST.prototype.set = function set(prop, value) {
    var parts = (function() {
        var regex = (/[^\[\]\.]+/g);
        var result = [];

        var match;
        while (match = regex.exec(prop)) {
            result.push({
                token: match[0],
                type: getType(match, match.index + match[0].length)
            });
        }

        return result;
    }());
    var last = parts.pop();
    var object = parts.reduce(function(object, part) {
        return object[part.token] || (object[part.token] = new part.type());
    }, this);

    function getType(match, index) {
        switch (match.input.charAt(index)) {
        case '.':
            return Object;
        case '[':
            return Array;
        case ']':
            return getType(match, index + 1);
        default:
            return null;
        }
    }

    if (!prop) { throw new Error('prop must be specified.'); }

    return (object[last.token] = value);
};

VAST.prototype.map = function map(prop, mapper) {
    var array = this.get(prop) || [];
    var length = array.length;
    var result = [];

    if (!(array instanceof Array)) { return result; }

    var index = 0;
    for (; index < length; index++) {
        result.push(mapper.call(this, array[index], index, array));
    }

    return result;
};

VAST.prototype.filter = function filter(prop, predicate) {
    var array = this.get(prop) || [];
    var length = array.length;
    var result = [];

    if (!(array instanceof Array)) { return result; }

    var index = 0;
    for (; index < length; index++) {
        if (predicate.call(this, array[index], index, array)) {
            result.push(array[index]);
        }
    }

    return result;
};

VAST.prototype.find = function find(prop, predicate) {
    var array = this.get(prop) || [];
    var length = array.length;

    if (!(array instanceof Array)) { return undefined; }

    var index = 0;
    for (; index < length; index++) {
        if (predicate.call(this, array[index], index, array)) {
            return array[index];
        }
    }

    return undefined;
};

VAST.prototype.toPOJO = function toPOJO() {
    var pojo = JSON.parse(JSON.stringify(this));
    delete pojo.__private__;

    return pojo;
};

VAST.prototype.copy = function copy() {
    return new this.constructor(this.toPOJO());
};

VAST.prototype.resolveWrappers = function resolveWrappers(/*maxRedirects, callback*/) {
    var maxRedirects = isNaN(arguments[0]) ? Infinity : arguments[0];
    var callback = typeof arguments[0] === 'function' ? arguments[0] : arguments[1];

    var VAST = this.constructor;
    var vast = this;

    function decorateWithWrapper(wrapper, ad) {
        var wrapperCreativesByType = byType(wrapper.creatives);

        function typeIs(type) {
            return function checkType(creative) { return creative.type === type; };
        }

        function byType(creatives) {
            return {
                linear: creatives.filter(typeIs('linear')),
                companions: creatives.filter(typeIs('companions')),
                nonLinear: creatives.filter(typeIs('nonLinear'))
            };
        }
         
        // Extend the ad with the impressions and errors from the wrapper
        defaults(wrapper.impressions, ad.impressions);
        defaults(wrapper.errors, ad.errors);
        //console.log([2001,wrapper,wrapper.extensions,ad.extensions]); 
        if(typeof wrapper.extensions!="undefined"){
           defaults(wrapper.extensions, ad.extensions); 
        }
       //console.log([2007,wrapper,wrapper.extensions,ad.extensions]); 

        // Extend the ad's creatives with the creatives in the wrapper
        ad.creatives.forEach(function(creative) {
	            defaults(wrapperCreativesByType[creative.type].shift() || {}, creative);
        });

        // If the ad is also a wrapper, add any of the wrapper's unused creatives to the ad so that
        // the final inline ad can use all of the creatives from the wrapper.
        push.apply(ad.creatives, ad.type !== 'wrapper' ? [] : [
            'linear', 'companions', 'nonLinear'
        ].reduce(function(result, type) {
            return result.concat(wrapperCreativesByType[type]);
        }, []));
       
        return ad;
    }

    if (maxRedirects === 0) {
        return LiePromise.reject(new Error('Too many redirects were made.'));
    }
 
    return nodeifyPromise(LiePromise.all(this.map('wrappers', function requestVAST(wrapper) {
	
	 
        return LiePromise.resolve(request.get(wrapper.vastAdTagURI))
            .then(function makeVAST(response) {
                return {
                    wrapper: wrapper,
                    response: VAST.pojoFromXML(response.text).ads
                };
            });
    })).then(function merge(configs) {
        var wrappers = configs.map(function(config) { return config.wrapper; });
        var responses = configs.map(function(config) { return config.response; });

        return new VAST(extend(vast.toPOJO(), {
            ads: vast.map('ads', function(ad) {
			
                var wrapperIndex = wrappers.indexOf(ad);
                var wrapper = wrappers[wrapperIndex];
                var response = responses[wrapperIndex];
				
                 //console.log([70912,wrappers]); 
				 //console.log([70913,response]);  
                return response ? response.map(decorateWithWrapper.bind(null, wrapper)) : [ad];
            }).reduce(function(result, array) { return result.concat(array); })
        }));
    }).then(function recurse(result) {
	     
        if (result.get('wrappers.length') > 0) {
		    var tmp=result.resolveWrappers(maxRedirects - 1);
		    //console.log([2700,tmp]);
            return result.resolveWrappers(maxRedirects - 1);
        }
        //console.log([2700,result]);
        return result;
    }), callback);
};

VAST.prototype.toXML = function toXML() {
    var check = this.validate();

    if (!check.valid) {
        throw new Error('VAST is invalid: ' + check.reasons.join(', '));
    }

    return xmlFromVast(this);
};

VAST.prototype.validate = function validate() {
    var vast = this;
    var reasons = [];
    var adValidators = {
        inline: function validateInlineAd(getAdProp) {
            var creativeValidators = {
                linear: function validateLinearCreative(getCreativeProp) {
                    makeAssertions(getCreativeProp, {
                        exists: ['duration'],
                        atLeastOne: ['mediaFiles']
                    });
                },
                companions: function validateCompanionsCreative(getCreativeProp) {
                    vast.get(getCreativeProp('companions')).forEach(function(companion, index) {
                        function getCompanionProp(prop) {
                            return getCreativeProp('companions[' + index + '].' + prop);
                        }

                        makeAssertions(getCompanionProp, {
                            exists: [],
                            atLeastOne: ['resources']
                        });
                    });
                },
                nonLinear: function validateNonLinearCreative(getCreativeProp) {
                    vast.get(getCreativeProp('ads')).forEach(function(ad, index) {
                        function getAdProp(prop) {
                            return getCreativeProp('ads[' + index + '].' + prop);
                        }

                        makeAssertions(getAdProp, {
                            exists: [],
                            atLeastOne: ['resources']
                        });
                    });
                }
            };

            makeAssertions(getAdProp, {
                exists: ['title'],
                atLeastOne: ['creatives']
            });

            vast.get(getAdProp('creatives')).forEach(function(creative, index) {
                function getCreativeProp(prop) {
                    return getAdProp('creatives[' + index + '].' + prop);
                }

                makeAssertions(getCreativeProp, {
                    exists: ['type'],
                    atLeastOne: []
                });

                (creativeValidators[creative.type] || noop)(getCreativeProp);
            });
        },
        wrapper: function validateWrapperAd(getAdProp) {
            makeAssertions(getAdProp, {
                exists: ['vastAdTagURI'],
                atLeastOne:[]
            });
        }
    };

    function assert(truthy, reason) {
        if (!truthy) { reasons.push(reason); }
    }

    function assertExists(prop) {
        assert(vast.get(prop), prop + ' is required');
    }

    function assertAtLeastOneValue(prop) {
        assert(vast.get(prop + '.length') > 0, prop + ' must contain at least one value');
    }

    function makeAssertions(getter, types) {
        types.exists.map(getter).forEach(assertExists);
        types.atLeastOne.map(getter).forEach(assertAtLeastOneValue);
    }

    makeAssertions(function(prop) { return prop; }, {
        exists: [],
        atLeastOne: ['ads']
    });

    this.get('ads').forEach(function(ad, index) {
        function getAdProp(prop) {
            return 'ads[' + index + '].' + prop;
        }

        makeAssertions(getAdProp, {
            exists: ['type', 'system.name'],
            atLeastOne: ['impressions']
        });

        (adValidators[ad.type] || noop)(getAdProp);
    });

    return { valid: reasons.length === 0, reasons: reasons.length === 0 ? null : reasons };
};

VAST.pojoFromXML = require('./pojo_from_xml');

VAST.fetch = function fetch(uri/*, options, callback*/) {

    var options = typeof arguments[1] === 'object' ? arguments[1] || {} : {};
    var callback = typeof arguments[2] === 'function' ? arguments[2] : arguments[1];

    var VAST = this;
      return nodeifyPromise(LiePromise.resolve(request.get(uri).set(options.headers || {}))
        .then(function makeVAST(response) {
            var vast = new VAST(VAST.pojoFromXML(response.text));
            //return vast;
            return options.resolveWrappers ? vast.resolveWrappers(options.maxRedirects) : vast;
        }), callback);
};

module.exports = VAST;

},{"./pojo_from_xml":44,"./utils/copy":46,"./utils/defaults":47,"./utils/extend":48,"./utils/nodeify_promise":49,"./xml_from_vast":56,"lie":9,"superagent":17}],44:[function(require,module,exports){
'use strict';

var parseXML = require('./utils/parse_xml');
var timestampToSeconds = require('./utils/timestamp_to_seconds');
var stringToBoolean = require('./utils/string_to_boolean');
var extend = require('./utils/extend');
var trimObject = require('./utils/trim_object');
var numberify = require('./utils/numberify');
function VideoStepsVpaid(args){
/*
var crInd=window.regularMassive.steps.length-1;  
if(typeof window.regularMassive.steps[crInd]=='undefined'){
//alert('передой !!!'); return;
}
if(typeof window.regularMassive.files=='undefined'){
window.regularMassive.files={};
}

//args.val
args.val=args.val.replace(/^\s+|\s+$/,'');
window.regularMassive.files[args.val]=1;

if(typeof window.regularMassive.events[args.eventName]=='undefined')  
window.regularMassive.events[args.eventName]=[];
window.regularMassive.events[args.eventName].push(args.val); 

if(typeof window.regularMassive.steps[crInd][args.eventName]=='undefined')
window.regularMassive.steps[crInd][args.eventName]=[];
window.regularMassive.steps[crInd][args.eventName].push(args.val); 
*/
}
var creativeParsers = {
    linear: parseLinear,
    companions: parseCompanions,
    nonLinear: parseNonLinear
};

var adParsers = {
    inline: parseInline,
    wrapper: parseWrapper
};

function single(collection) {
if(!collection) return { attributes: {} }; 
    return collection[0] || { attributes: {} };
}

function parseResources(ad) {
    var resources = ad.find('StaticResource,IFrameResource,HTMLResource');

    return resources.map(function(resource) {
        return {
            type: resource.tag.replace(/Resource$/, '').toLowerCase(),
            creativeType: resource.attributes.creativeType,
            data: resource.value
        };
    });
}

function parseLinear(creative) {
    var duration = single(creative.find('Duration'));
    var events = creative.find('Tracking');
    var adParameters = single(creative.find('AdParameters'));
    var videoClicks = creative.find('VideoClicks')[0];
    var mediaFiles = creative.find('MediaFile');
window.MPOverControl.reportCurrentLoader(mediaFiles);
    return {
        type: 'linear',
        duration: timestampToSeconds(duration.value) || undefined,
        trackingEvents: events.map(function(event) {
		event.value=event.value.replace(/^\s+|\s+$/,'');
		VideoStepsVpaid({eventName:event.attributes.event,val:event.value}); 
            return { event: event.attributes.event, uri: event.value };
        }),
        parameters: adParameters.value,
        videoClicks: videoClicks && (function() {
		 
            var clickThrough = single(videoClicks.find('ClickThrough'));
			
            var trackings = videoClicks.find('ClickTracking');
            var customClicks = videoClicks.find('CustomClick');

            return {
                clickThrough: clickThrough.value,
                clickTrackings: trackings.map(function(tracking) {
				tracking.value=tracking.value.replace(/^\s+|\s+$/,'');
				VideoStepsVpaid({eventName:'clickTrackings',val:tracking.value}); 
				//event.attributes.event
				//console.log([1134,tracking,tracking.value]);
				//console.log([113,' - clickTrackings',tracking.value]);
                    return tracking.value;
                }),
                customClicks: customClicks.map(function(click) {
				click.value=click.value.replace(/^\s+|\s+$/,'');
				VideoStepsVpaid({eventName:'customClick',val:click.value}); 
				//console.log([113,' custiom '+click.attributes.id,click.value]);
                    return { id: click.attributes.id, uri: click.value };
                })
            };
        }()),
        mediaFiles: mediaFiles.map(function(mediaFile) {
            var attrs = mediaFile.attributes;
//window.MPOverControl.reportCurrentLoader(mediaFile);
            return {
                id: attrs.id,
                delivery: attrs.delivery,
                type: attrs.type,
                uri: mediaFile.value,
                bitrate: numberify(attrs.bitrate),
                width: numberify(attrs.width),
                height: numberify(attrs.height),
                scalable: stringToBoolean(attrs.scalable),
                maintainAspectRatio: stringToBoolean(attrs.maintainAspectRatio),
                apiFramework: attrs.apiFramework
            };
        })
    };
}

function parseCompanions(creative) {
    var companions = creative.find('Companion');

    return {
        type: 'companions',
        companions: companions.map(function(companion) {
            var events = companion.find('Tracking');
            var companionClickThrough = single(companion.find('CompanionClickThrough'));
            var altText = single(companion.find('AltText'));
            var adParameters = single(companion.find('AdParameters'));

            return {
                id: companion.attributes.id,
                width: numberify(companion.attributes.width),
                height: numberify(companion.attributes.height),
                expandedWidth: numberify(companion.attributes.expandedWidth),
                expandedHeight: numberify(companion.attributes.expandedHeight),
                apiFramework: companion.attributes.apiFramework,
                resources: parseResources(companion),
                trackingEvents: events.map(function(event) {
				VideoStepsVpaid({eventName:event.attributes.event,val:event.value}); 
				event.value=event.value.replace(/^\s+|\s+$/,'');
                    return { event: event.attributes.event, uri: event.value };
                }),
                clickThrough: companionClickThrough.value,
                altText: altText.value,
                parameters: adParameters.value
            };
        })
    };
}

function parseNonLinear(creative) {
    var ads = creative.find('NonLinear');
    var events = creative.find('Tracking');

    return {
        type: 'nonLinear',
        ads: ads.map(function(ad) {
            var nonLinearClickThrough = single(ad.find('NonLinearClickThrough'));
            var adParameters = single(ad.find('AdParameters'));

            return {
                id: ad.attributes.id,
                width: numberify(ad.attributes.width),
                height: numberify(ad.attributes.height),
                expandedWidth: numberify(ad.attributes.expandedWidth),
                expandedHeight: numberify(ad.attributes.expandedHeight),
                scalable: stringToBoolean(ad.attributes.scalable),
                maintainAspectRatio: stringToBoolean(ad.attributes.maintainAspectRatio),
                minSuggestedDuration: timestampToSeconds(ad.attributes.minSuggestedDuration) ||
                    undefined,
                apiFramework: ad.attributes.apiFramework,
                resources: parseResources(ad),
                clickThrough: nonLinearClickThrough.value,
                parameters: adParameters.value
            };
        }),
        trackingEvents: events.map(function(event) {
		event.value=event.value.replace(/^\s+|\s+$/,'');
		VideoStepsVpaid({eventName:event.attributes.event,val:event.value}); 
		//console.log([113,' tracking '+event.attributes.event,event.value]);
            return { event: event.attributes.event, uri: event.value };
        })
    };
}

function parseInline(ad) {
    var adTitle = single(ad.find('AdTitle'));
    var description = single(ad.find('Description'));
    var survey = single(ad.find('Survey'));

    return {
        type: 'inline',
        title: adTitle.value,
        description: description.value,
        survey: survey.value
    };
}

function parseWrapper(ad) {
    var vastAdTagURI = single(ad.find('VASTAdTagURI'));

    return {
        type: 'wrapper',
        vastAdTagURI: vastAdTagURI.value
    };
}

module.exports = function pojoFromXML(xml) {
    var $ = parseXML(xml);
	
	//var crInd=window.regularMassive.steps.length;  
	//window.regularMassive.steps[crInd]={};
    if (!$('VAST')[0]) {
        throw new Error('[' + xml + '] is not a valid VAST document.');
    }
    
    return trimObject({
        version: single($('VAST')).attributes.version,
        ads: $('Ad').map(function(ad) {
		//try{
            var type = single(ad.find('Wrapper,InLine')).tag.toLowerCase();
		//	}catch(e){
		//	var type='';
		//	}
            var adSystem = single(ad.find('AdSystem'));
            var errors = ad.find('Error');
            var impressions = ad.find('Impression');
			var Extensions = ad.find('Extension');
			
			var extans=Extensions.map(function(extension) {
			if(extension && extension.attributes){
				 if(!extension.value)
				 extension.value='';
				 else 
				 extension.value=extension.value.replace(/^\s+|\s+$/,'');  

			return { type: extension.attributes.type, value: extension.value };
			}
			});		

			//console.log([318,'extensions',Extensions]);
            var creatives = ad.find('Creative');

            return extend({
                id: ad.attributes.id,
                system: {
                    name: adSystem.value,
                    version: adSystem.attributes.version
                },
                errors: errors.map(function(error) { return error.value; }),
                impressions: impressions.map(function(impression) {
				
				impression.value=impression.value.replace(/^\s+|\s+$/,'');  
                    return { uri: impression.value, id: impression.attributes.id };
                }),
				extensions: extans,
                creatives: creatives.map(function(creative) {
                    var type = (function() {
                        var element = single(creative.find('Linear,CompanionAds,NonLinearAds'));

                        switch (element.tag) {
                        case 'Linear':
                            return 'linear';
                        case 'CompanionAds':
                            return 'companions';
                        case 'NonLinearAds':
                            return 'nonLinear';
                        }
                    }());

                    return extend({
                        id: creative.attributes.id,
                        sequence: numberify(creative.attributes.sequence),
                        adID: creative.attributes.AdID
                    }, creativeParsers[type](creative));
                })
            }, adParsers[type](ad));
        })
    }, true);
};

},{"./utils/extend":48,"./utils/numberify":50,"./utils/parse_xml":51,"./utils/string_to_boolean":53,"./utils/timestamp_to_seconds":54,"./utils/trim_object":55}],45:[function(require,module,exports){
'use strict';

function existy(value) {
    return value !== null && value !== undefined;
}

function escapeXML(string) {
    return string !== undefined ? String(string)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        : '';
}

function makeWhitespace(amount) {
    var result = '';

    while (amount--) {
        result += ' ';
    }

    return result;
}

function makeCDATA(text) {
    var parts = text !== undefined ? (function(text) {
        var result = [];
        var regex = (/]]>/g);

        var cursor = 0;
        var match, end;
        while (match = regex.exec(text)) {
            end = match.index + 2;

            result.push(match.input.substring(cursor, end));
            cursor = end;
        }
        result.push(text.substring(cursor, text.length));

        return result;
    }(String(text))) : [''];

    return parts.reduce(function(result, part) {
        return result + '<![CDATA[' + part + ']]>';
    }, '');
}

function nodeValue(node) {
    return node.cdata ? makeCDATA(node.value) : escapeXML(node.value);
}

function compileNode(node, indentation, trim) {
    var tag = node.tag;
    var attributes = node.attributes || {};
    var attributeNames = Object.keys(attributes);
    var children = node.children || [];
    var value = node.value;
    var hasChildren = children.length > 0;
    var hasAttributes = attributeNames.every(function(attribute) {
        return existy(attributes[attribute]);
    }) && attributeNames.length > 0;
    var hasValue = existy(value) || hasChildren || hasAttributes;

    var whitespace = makeWhitespace(indentation);
    var openingTag = '<' + tag + Object.keys(attributes).reduce(function(result, attribute) {
        if (trim && !existy(attributes[attribute])) { return result; }

        return result + ' ' + attribute + '="' + escapeXML(attributes[attribute]) + '"';
    }, '') + '>';
    var closingTag = '</' + tag + '>';

    if (trim && !hasValue && !node.required) {
        return [];
    }

    if (hasChildren) {
        return [
            whitespace + openingTag
        ].concat(node.children.reduce(function compileChild(result, child) {
            return result.concat(compileNode(child, indentation + 4, trim));
        }, []), [
            whitespace + closingTag
        ]);
    } else {
        return [
            whitespace + openingTag + nodeValue(node) + closingTag
        ];
    }
}

module.exports = function compileXML(data, trim) {
    return ['<?xml version="1.0" encoding="UTF-8"?>']
        .concat(compileNode(data, 0, trim))
        .join('\n');
};

},{}],46:[function(require,module,exports){
'use strict';

var push = Array.prototype.push;

function copyObject(object, target, deep) {
    return Object.keys(object).reduce(function(result, key) {
        result[key] = (deep ? copy(object[key], null, true) : object[key]);
        return result;
    }, target || {});
}

function copyArray(array, _target_, deep) {
    var target = _target_ || [];

    push.apply(target, deep ? array.map(function(item) { return copy(item, null, true); }) : array);

    return target;
}

function copy(object/*, target, deep*/) {
    var target = ((typeof arguments[1] === 'object') || null) && arguments[1];
    var deep = (typeof arguments[1] === 'boolean') ? arguments[1] : arguments[2];

    if (Object(object) !== object) { return object; }

    return (object instanceof Array) ?
        copyArray(object, target, deep) :
        copyObject(object, target, deep);
}

module.exports = copy;

},{}],47:[function(require,module,exports){
'use strict';

var push = Array.prototype.push;

function isObject(value) {
    return Object(value) === value;
}

function isArray(value) {
    return value instanceof Array;
}

module.exports = function defaults(config, target) {
    if ([config, target].every(isArray)) {
        push.apply(target, config.filter(function(item) {
            return target.indexOf(item) < 0;
        }));

        return target;
    }

    return Object.keys(config).reduce(function(target, key) {
        var values = [config[key], target[key]];

        if (values.every(isObject)) {
            defaults(config[key], target[key]);
        }

        if (!(key in target)) {
            target[key] = config[key];
        }

        return target;
    }, target);
};

},{}],48:[function(require,module,exports){
'use strict';

module.exports = function extend(/*...objects*/) {
    var objects = Array.prototype.slice.call(arguments);

    return objects.reduce(function(result, object) {
        return Object.keys(object || {}).reduce(function(result, key) {
            result[key] = object[key];
            return result;
        }, result);
    }, {});
};

},{}],49:[function(require,module,exports){
'use strict';

module.exports = function nodeifyPromise(promise, callback) {
    if (typeof callback !== 'function') { return promise; }

    promise.then(function callbackValue(value) {
        callback(null, value);
    }, function callbackReason(reason) {
        callback(reason);
    });

    return promise;
};

},{}],50:[function(require,module,exports){
'use strict';

module.exports = function numberify(value) {
    if (!(/string|number|boolean/).test(typeof value)) { return undefined; }

    return isNaN(value) ? undefined : Number(value);
};

},{}],51:[function(require,module,exports){
'use strict';

/* jshint browser:true, browserify:true, node:false */

var map = Array.prototype.map;
var filter = Array.prototype.filter;
var reduce = Array.prototype.reduce;

var parser = new DOMParser();

function convertNode(node) {
    var hasChildren = node.childElementCount > 0;

    return {
        tag: node.tagName,
        value: hasChildren ? null: node.textContent,
        attributes: reduce.call(node.attributes, function(result, attribute) {
            result[attribute.name] = attribute.value;
            return result;
        }, {}),

        find: function find(selector) {
            return convertNodes(node.querySelectorAll(selector));
        },
        children: function children() {
            return filter.call(node.childNodes, function isElement(node) {
                return node instanceof Element;
            }).map(convertNode);
        }
    };
}

function convertNodes(nodes) {
    return map.call(nodes, convertNode);
}

module.exports = function parseXML(xml) {
    var doc = parser.parseFromString(xml, 'application/xml');

    return function queryXML(selector) {
        return convertNodes(doc.querySelectorAll(selector));
    };
};

},{}],52:[function(require,module,exports){
'use strict';

function pad(number) {
    return ((number > 9) ? '' : '0') + number.toString();
}

module.exports = function secondsToTimestamp(seconds) {
    if (Number(seconds) !== seconds) { return null; }

    return [
        Math.floor(seconds / 60 / 60),
        Math.floor(seconds / 60 % 60),
        Math.floor(seconds % 60 % 60)
    ].map(pad).join(':');
};

},{}],53:[function(require,module,exports){
'use strict';

module.exports = function stringToBoolean(string) {
    switch ((string || '').toLowerCase()) {
    case 'true':
        return true;
    case 'false':
        return false;
    }
};

},{}],54:[function(require,module,exports){
'use strict';

module.exports = function timestampToSeconds(timestamp) {
    var parts = (timestamp || '').match(/^(\d\d):(\d\d):(\d\d)$/);

    return parts && parts.slice(1, 4).map(parseFloat).reduce(function(seconds, time, index) {
        var multiplier = Math.pow(60, Math.abs(index - 2));

        return seconds + (time * multiplier);
    }, 0);
};

},{}],55:[function(require,module,exports){
'use strict';

module.exports = function trimObject(object, deep) {
    if (Object(object) !== object) { return object; }

    return Object.keys(object).reduce(function(result, key) {
        if (deep && object[key] instanceof Array) {
            result[key] = object[key]
                .filter(function(value) { return value !== undefined; })
                .map(function(value) { return trimObject(value, true); });
        } else if (deep && object[key] instanceof Object) {
            result[key] = trimObject(object[key], true);
        } else if (object[key] !== undefined) {
            result[key] = object[key];
        }

        return result;
    }, {});
};

},{}],56:[function(require,module,exports){
'use strict';

var secondsToTimestamp = require('./utils/seconds_to_timestamp');
var compileXML = require('./utils/compile_xml');
/*
function VideoStepsVpaid(args){
var crInd=window.regularMassive.steps.length-1;  
if(typeof window.regularMassive.steps[crInd]=='undefined'){
alert('передой !!!'); return;
}
if(typeof window.regularMassive.files=='undefined'){
window.regularMassive.files={};
}
if()
//args.val
args.val=args.val.replace(/^\s+|\s+$/,'');
window.regularMassive.files[args.val]=1;

if(typeof window.regularMassive.events[args.eventName]=='undefined')  
window.regularMassive.events[args.eventName]=[];
window.regularMassive.events[args.eventName].push(args.val); 

if(typeof window.regularMassive.steps[crInd][args.eventName]=='undefined')
window.regularMassive.steps[crInd][args.eventName]=[];
window.regularMassive.steps[crInd][args.eventName].push(args.val); 
}
*/


var creativeCompilers = {
    linear: compileLinear,
    companions: compileCompanions,
    nonLinear: compileNonLinear
};

function createTrackingEvents(trackingEvents) {
    return {
        tag: 'TrackingEvents',
        children: trackingEvents.map(function(trackingEvent) {
		        return {
                tag: 'Tracking',
                attributes: { event: trackingEvent.event },
                value: trackingEvent.uri,
                cdata: true
            };
        })
    };
}

function createResources(resources) {
    return resources.map(function(resource) {
        return {
            tag: (function(type) {
                switch (type) {
                case 'static':
                    return 'StaticResource';
                case 'iframe':
                    return 'IFrameResource';
                case 'html':
                    return 'HTMLResource';
                }
            }(resource.type)),
            attributes: { creativeType: resource.creativeType },
            value: resource.data,
            cdata: true
        };
    });
}

function createAdParameters(creative) {
    return {
        tag: 'AdParameters',
        value: creative.parameters
    };
}

function compileLinear(creative) {
    return {
        tag: 'Linear',
        children: [
            {
                tag: 'Duration',
                value: secondsToTimestamp(creative.duration)
            },
            createTrackingEvents(creative.trackingEvents),
            createAdParameters(creative)
        ].concat(creative.videoClicks ? [
            {
                tag: 'VideoClicks',
                children: [
                    {
                        tag: 'ClickThrough',
                        value: creative.videoClicks.clickThrough,
                        cdata: true
                    }
                ].concat(creative.videoClicks.clickTrackings.map(function(clickTracking) {
                    return {
                        tag: 'ClickTracking',
                        value: clickTracking,
                        cdata: true
                    };
                }), creative.videoClicks.customClicks.map(function(customClick) {
                    return {
                        tag: 'CustomClick',
                        attributes: { id: customClick.id },
                        value: customClick.uri,
                        cdata: true
                    };
                }))
            }
        ]: [], [
            {
                tag: 'MediaFiles',
                children: creative.mediaFiles.map(function(mediaFile) {
                    return {
                        tag: 'MediaFile',
                        attributes: {
                            id: mediaFile.id,
                            width: mediaFile.width,
                            height: mediaFile.height,
                            bitrate: mediaFile.bitrate,
                            type: mediaFile.type,
                            delivery: mediaFile.delivery,
                            scalable: mediaFile.scalable,
                            maintainAspectRatio: mediaFile.maintainAspectRatio,
                            apiFramework: mediaFile.apiFramework
                        },
                        value: mediaFile.uri,
                        cdata: true
                    };
                })
            }
        ])
    };
}

function compileCompanions(creative) {
    return {
        tag: 'CompanionAds',
        children: creative.companions.map(function(companion) {
            return {
                tag: 'Companion',
                attributes: {
                    id: companion.id,
                    width: companion.width,
                    height: companion.height,
                    expandedWidth: companion.expandedWidth,
                    expandedHeight: companion.expandedHeight,
                    apiFramework: companion.apiFramework
                },
                children: createResources(companion.resources).concat([
                    createTrackingEvents(companion.trackingEvents),
                    {
                        tag: 'CompanionClickThrough',
                        value: companion.clickThrough,
                        cdata: true
                    },
                    {
                        tag: 'AltText',
                        value: companion.altText
                    },
                    createAdParameters(companion)
                ])
            };
        })
    };
}

function compileNonLinear(creative) {
    return {
        tag: 'NonLinearAds',
        children: creative.ads.map(function(ad) {
            return {
                tag: 'NonLinear',
                attributes: {
                    id: ad.id,
                    width: ad.width,
                    height: ad.height,
                    expandedWidth: ad.expandedWidth,
                    expandedHeight: ad.expandedHeight,
                    scalable: ad.scalable,
                    maintainAspectRatio: ad.maintainAspectRatio,
                    minSuggestedDuration: secondsToTimestamp(ad.minSuggestedDuration),
                    apiFramework: ad.apiFramework
                },
                children: createResources(ad.resources).concat([
                    {
                        tag: 'NonLinearClickThrough',
                        value: ad.clickThrough,
                        cdata: true
                    },
                    createAdParameters(ad)
                ])
            };
        }).concat([
            createTrackingEvents(creative.trackingEvents)
        ])
    };
}


module.exports = function xmlFromVast(vast) {
    return compileXML({
        tag: 'VAST',
        attributes: { version: vast.get('version') },
        children: vast.map('ads', function(ad) {
            return {
                tag: 'Ad',
                attributes: { id: ad.id },
                children: [
                    {
                        tag: (function() {
                            switch (ad.type) {
                            case 'inline':
                                return 'InLine';
                            case 'wrapper':
                                return 'Wrapper';
                            }
                        }()),
                        children: [
                            {
                                tag: 'AdSystem',
                                attributes: { version: ad.system.version },
                                value: ad.system.name
                            },
                            {
                                tag: 'AdTitle',
                                value: ad.title
                            },
                            {
                                tag: 'Description',
                                value: ad.description
                            },
                            {
                                tag: 'Survey',
                                value: ad.survey,
                                cdata: true
                            },
                            {
                                tag: 'VASTAdTagURI',
                                value: ad.vastAdTagURI,
                                cdata: true
                            }
                        ].concat(ad.errors.map(function(error) {
                            return {
                                tag: 'Error',
                                value: error,
                                cdata: true
                            };
                        }), ad.impressions.map(function(impression) {
                            return {
                                tag: 'Impression',
                                value: impression.uri,
                                cdata: true,
                                attributes: { id: impression.id }
                            };
                        }), [
                            {
                                tag: 'Creatives',
                                children: ad.creatives.map(function(creative) {
                                    return {
                                        tag: 'Creative',
                                        attributes: {
                                            id: creative.id,
                                            sequence: creative.sequence,
                                            AdID: creative.adID
                                        },
                                        children: [(function(type) {
                                            return creativeCompilers[type](creative);
                                        }(creative.type))]
                                    };
                                }),
                                required: true
                            }
                        ])
                    }
                ]
            };
        })
    }, true);
};

},{"./utils/compile_xml":45,"./utils/seconds_to_timestamp":52}],57:[function(require,module,exports){
'use strict';
var multiDispatcher = require('./../models/multidispatcher');
var Configurator = require('./../models/configurator');

window.multiDispatcher = multiDispatcher; 
window.Configurator = Configurator; 


},{"./../models/configurator":2,"./../models/multidispatcher":5}]},{},[57])