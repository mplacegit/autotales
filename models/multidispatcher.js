'use strict';
var httpclient = require('./httpclient');
var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');

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
//console.log([813334,this.CurrentLoadedXmlIndex,data]);
 var preRemoteData={key:window.GlobalMyGUITemp,ind:this.CurrentLoadedXmlIndex,meta:data};
 var preToURL="http://widget2.market-place.su/admin/statistic/video/test?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData)); 
// console.log([813334,preToURL]);     
 //var img = new Image(1,1);
 //img.src =  preToURL;   
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
	function TimerFunction(args){
	
	
	
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
	}
	this.player= new VASTPlayer(document.getElementById("container"),{timerFunc:TimerFunction});
	this.player.__private__.makePause=0;
	  this.player.on('AdVolumeChange', function() {
	   self.checkMuteButton();
      });
	
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
this.config=config;
this.pid=config.pid;
this.affiliate_id=config.affiliate_id;
this.links=config.ads;
//console.log([318,config.ads]);
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
   var self=this; 
   if(typeof this.links[ind]=='undefined'){
   if(this.checkLoadedQueue()) {
     this.currentIndexListen=1;
     if(!this.emptyStart){
     this.readyToPlayThird();
	 }
	 }
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
   // console.log([400,uri]);

	self.sendStatistic({id:self.links[ind].id,eventName:'srcRequest'});  
	window.MPOverControl.CurrentLoadedXmlIndex=self.links[ind].id;
	//this.player.currentInd=links[ind].id; 
    this.player.loadNew(uri).then(function getLoad(res){
	self.cacheloadedIndexes[ind]=1;
	res.index=ind;
	 self.resourcesToPlay[ind]=res;
	 self.queueToPlay.push(ind);
		    self.startPlayQueue();
	        setTimeout(function() { 
					   self.pushQueue((ind+1));
					   }, 1500); 
	}).catch(function emitError(reason) {
	self.cacheloadedIndexes[ind]=3;
	//console.log([754,ind,reason]);
	var mess='';
	if(typeof reason != 'undefined' && typeof reason.message != 'undefined'){
	 mess=reason.message;
	}
	else{
	if(typeof reason != 'undefined')
    mess=JSON.stringify(reason);
	}
    self.sendStatistic({id:self.links[ind].id,eventName:'srcLoadError',mess:mess});  
	
	self.pushQueue((ind+1)); 
    });
}; 
multidispatcher.prototype.sendPixel = function sendPixel(data) 
{
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.pid,affiliate_id:this.affiliate_id,id_src:data.id};
   var preToURL="http://widget2.market-place.su/admin/statistic/video/put?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData)); 
  var img = new Image(1,1);
  img.src =  preToURL; 
  return;
};
multidispatcher.prototype.changeIndex = function multidispatcher(index) {
      if(typeof this.ListenedIndexes[index]!='undefined') return;
	  			if(this.placeHolder){
				this.placeHolder.style.display="block";
				}
      this.ListenedIndexes[index]=1;
	 				this.queueToPlaySemaphore=0;
			        this.startPlayQueue();
return false;
};
multidispatcher.prototype.startPlayQueue = function startPlayQueue() {
 this.emptyStart=1;
 var self=this;
 
 if(this.queueToPlaySemaphore){ /*идёт проигрывание*/
 	                   setTimeout(function() { 
					   self.startPlayQueue();
					   }, 200); 
 return; 
 }
 var index=this.queueToPlay.shift();

 if(typeof index=='undefined'){ /*очередь на проигрывание пустая*/
 if(this.currentIndexListen && !this.queueToPlaySemaphore){ /*все линки прочитаны*/
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
multidispatcher.prototype.checkMuteButton = function checkMuteButton()
{
      //console.log([31855,'мут',this.player.adVolume]);
      if(typeof this.player.muteButton!='undefined') 
	  this.player.muteButton.innerHTML=renderControl("muteButton",this.player.adVolume);

};

multidispatcher.prototype.createExtraSlot = function createExtraSlot() 
{

  var self=this;
  this.player.isPaused=0;
  this.player.isClicked=0;
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

   this.player.ControllerAction=function(args){  
   if(args.index==-1){
   console.log([1233333,'или четыре']);
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
	  if(typeof self.player.timeoutDiv!="undefined")
	  self.player.timeoutDiv.innerHTML=txt;
	  if(controls[0]=="1"&&showCLose){
		  //consoleLog([668,'Настало твоё время']);
		  self.player.closeDiv.style.display='block';
	  }
	  if(controls[0]=="1"&&showSkip){
		  self.player.skipDiv.style.display='block';
	  }
  };
 
   this.player.drawControls=function(){
	   
		//clickable
		self.clickable=document.createElement("DIV");
		self.clickable.setAttribute("id","clickable");
		self.clickable.style.width=self.config.width+"px";
		self.clickable.style.height=self.config.height+"px";
		self.clickable.style.border="1px solid #000000";
		self.clickable.style.position="absolute";
		self.clickable.style.top="0";
		self.clickable.style.left="0";
		self.clickable.style.zIndex=1000;
		
		self.resumeButton=document.createElement("DIV");
		self.resumeButton.style.zIndex=1003;
		//self.resumeButton.style.border="3px solid #FFFFFF";
		self.resumeButton.style.color="#FFFFFF";
		self.resumeButton.style.width="100%";
		self.resumeButton.style.height="100%";
		//self.resumeButton.style.padding="40%";
		self.resumeButton.style.cursor="pointer";
        self.resumeButton.style.display="none";
		
		//self.resumeButton.innerHTML='продолжить ...';
		self.resumeButton.className="resume-play";
		self.clickable.appendChild(self.resumeButton);
		self.slot.appendChild(self.clickable);
		//timeoutDiv
		var timeoutDiv=document.createElement('div');
		timeoutDiv.id="timeoutDiv";
		self.player.timeoutDiv=timeoutDiv;
		self.slot.appendChild(timeoutDiv);

		//closeDiv
		var closeDiv=document.createElement('div');
		closeDiv.id="closeDiv";
		self.player.closeDiv=closeDiv;
		self.slot.appendChild(closeDiv);
		closeDiv.innerHTML=renderControl("closeAd");
		closeDiv.style.display='none';
		closeDiv.onclick=function(e){
			e.preventDefault();
			self.reporter.reporter.manualCase('close');
			self.player.stopAd();


		};

		//skipDiv
		var skipDiv=document.createElement('div');
		self.player.skipDiv=skipDiv;
		skipDiv.id="skipDiv";
		self.slot.appendChild(skipDiv);
		skipDiv.innerHTML=renderControl("skipAd");
		skipDiv.style.display='none';
		skipDiv.onclick=function(e){
			e.preventDefault();
			self.reporter.reporter.manualCase('skip');

			for(var i =0;i<skipAd.length;i++){
				new Image().src = skipAd[i];
			}
			self.player.stopAd();
		};
		//advLink
		var advLink=document.createElement('div');
		advLink.id="advLink";
		self.player.advLink=advLink;
		self.slot.appendChild(advLink);
		advLink.innerHTML=renderControl("advLink",decodeURIComponent(linkTxt[0]));
		var clickThrough = self.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
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
		self.player.muteButton=muteButton;
		self.slot.appendChild(muteButton);
		muteButton.innerHTML=renderControl("muteButton",self.player.adVolume);
		muteButton.onclick=function(e){
			e.preventDefault();
			//e.preventBubble();
			//consoleLog([1234321,e.preventDefault])

			self.player.adVolume=self.player.adVolume?0:0.6;
  var userid=CookieDriver.getUserID();
  if(!self.player.adVolume){
  self.plSettings.mute=true;
  }else{
  self.plSettings.mute=false;
 }
 console.log([318553,'саве',self.plSettings.mute]);  
 CookieDriver.saveObject(self.plSettings,userid);
			return false;
		}
	}
            this.player.vast.map('ads[0].extensions', function(extension){
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
	this.player.drawControls();
    this.clickable.onclick=function(){
    self.ConrolePaused(isClickable[0]);

  }
};
multidispatcher.prototype.ConrolePaused = function ConrolePaused(isClickable) 
{

 if(!this.player.isPaused){
 if(typeof this.resumeButton)
 this.resumeButton.style.display="block";
  this.player.isPaused=1;
  this.player.pauseAd();
  this.reporter.reporter.manualCase('clickThrough');
   var clickThrough = this.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
   var playerHandles=isClickable;
           if (playerHandles && clickThrough) {
               window.open(clickThrough);
           }
  }else{
  if(typeof this.resumeButton!='undefined')
  this.resumeButton.style.display="none";
  this.player.isPaused=0;
  this.player.resumeAd();
  }
};
multidispatcher.prototype.clearExtraSlot = function clearExtraSlot() 
{
if (typeof this.resumeButton!='undefined'){
delete this.resumeButton;
}
if(typeof this.player.ControllerAction=='function')
delete this.player.ControllerAction;
if(this.player.muteButton)
delete this.player.muteButton;
if(this.slot){
this.container.removeChild(this.slot);
}

this.slot=null;

//this.container.innerHTML="";
};
multidispatcher.prototype.readyToPlayThird=function readyToPlayThird(){

if(this.thirdPartyFlag) return;
this.thirdPartyFlag=1;
   this.clearExtraSlot();
   this.container.innerHTML='';
   this.container.style.display='none';
   if(typeof this.collbackFunction =='function'){

   console.log(this.config);
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
console.log([318,'опенширма']);
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
		        self.player.adVolume=0.6;
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


};

module.exports = multidispatcher; 
			     