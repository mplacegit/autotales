'use strict';
var httpclient = require('./httpclient');
var Configurator = require('./configurator');
var consoleLog = require('./consoleLog');

var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');

function renderControl(type,args) {

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

function discontext()
{
	this.h1='';
	this.pid='';
	this.contextH1='';
	this.affiliate_id='';
	this.links=[];
	this.reporter=null;
	this.currentIndexPlayer=-1;
	this.thirdPartyFlag=0;
	this.currentIndexListen=0;
	this.ListenedIndexes={};
	this.cacheStatisticIndexes={};
	this.cacheloadedIndexes={};
	this.queueToPlaySemaphore=0;
	this.queueToPushSemaphore=0;
	this.defaultEnded=false;
	this.tmpPlayArCnt=0;
	this.emptyStart=0;
	this.cookieUserid=CookieDriver.getUserID();
	this.defaultURLs=["http://apptoday.ru/videotest/autoplay/trailers/ivancarevichiseryjvolk3_trailer2_854.mp4","http://apptoday.ru/videotest/autoplay/trailers/minions_rutrailer_1280.mp4"];
	this.referer= 'http://apptoday.ru';
	this.player= new VASTPlayer(document.getElementById("container"));
	this.player.__private__.makePause=0;
	var self=this;
	this.container=document.getElementById("container");
	//alert(this.container);
	  this.player.on('AdPaused', function() {
	   //console.log([58,'AdPaused']);
	  });
	 // this.player.on('AdStopped', function() {
	  // self.clearExtraSlot();
	  //});
	//this.player.on('AdPlaying', function() {
	  // console.log([58,'AdPaused']);
	 // });

	 this.player.on('AdVolumeChange', function() {
	   //this.pauseAd();
	   self.checkMuteButton();
	  // console.log([58,'AdClickThru']);
      });
	 this.player.on('AdClickThru', function() {
	   //this.pauseAd();
	  // console.log([58,'AdClickThru']);
      });	 
    if (typeof this.GlobalMyGUITemp == 'undefined'){
    this.GlobalMyGUITemp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    }
	//console.log([92,this.__private__.makePause]);
   this.fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;	
	
	
	this.queueToPlay=[];
	this.queueToPlaySemaphore=0;
	this.resourcesToPlay={};
}; 
discontext.prototype.checkMuteButton = function checkMuteButton()
{
     if(typeof this.player.muteButton!='undefined') 
	this.player.muteButton.innerHTML=renderControl("muteButton",this.player.adVolume);

};
discontext.prototype.clearExtraSlot = function clearExtraSlot() 
{
if(this.slot)
this.container.removeChild(this.slot);
this.slot=null;
//this.container.innerHTML="";
};
discontext.prototype.createExtraSlot = function createExtraSlot() 
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
  this.player.TriodAction=function(args){
  if(typeof args.index=='undefined' || args.index<0) return; 
   self.sendPixel({id:self.links[args.index].id});
   self.sendStatistic({id:self.links[args.index].id,eventName:'filterPlayMedia'}); 
   //console.log(['трисекунды',self.links[args.index].title]);
  }
  this.player.ControllerAction=function(args){  
 // console.log(['простотри',skipTime]);
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
	  // console.log(['простотри',skipTimeInt,skipTimeInt2]);
	  var showCLose=(skipTimeInt2<=parseInt(args.sec)&&skipTimeInt2>0);
	  var showSkip=(skipTimeInt<=parseInt(args.sec)&&skipTimeInt>0);
	  args.skipTime=skipTimeInt-parseInt(args.sec);
	  args.showControls=(controls[0]=="1");
	  var txt=renderControl("timeoutEl",args);
	  self.player.timeoutDiv.innerHTML=txt;
	  //consoleLog([669,[showCLose,skipTimeInt,parseInt(args.sec)]]);
	  //consoleLog([669,[showSkip,skipTimeInt2,parseInt(args.sec)]]);

	  //показываем контролы, если надо

	  if(controls[0]=="1"&&showCLose){
		  //consoleLog([668,'Настало твоё время']);
		  self.player.closeDiv.style.display='block';
	  }
	  if(controls[0]=="1"&&showSkip){
		  //consoleLog([668,'Настало твоё время']);
		  self.player.skipDiv.style.display='block';
	  }


  //console.log([-2,args]);
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

			//for(var i =0;i<skipAd.length;i++){
			//	new Image().src = skipAd[i];
			//}
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
        //return;
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
 CookieDriver.saveObject(self.plSettings,userid);

			
			//self.player.muteButton.innerHTML=renderControl('muteButton',self.player.adVolume);
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


			//this.slot.innerHTML=decodeURIComponent(linkTxt[0]);
	this.player.drawControls();

			
  this.clickable.onclick=function(){
  self.ConrolePaused(isClickable[0]);

  }
};


discontext.prototype.ConrolePaused = function ConrolePaused(isClickable) 
{

 if(!this.player.isPaused){
  this.player.isPaused=1;
  this.player.pauseAd();
  this.reporter.reporter.manualCase('clickThrough');
   var clickThrough = this.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
   //alert(clickThrough);
   var playerHandles=isClickable;
   //if(!this.player.isClicked){
   //this.player.isClicked=1;
           if (playerHandles && clickThrough) {
               window.open(clickThrough);
           }
	//}	   
  
  }else{
  this.player.isPaused=0;
  this.player.resumeAd();
  }
};
discontext.prototype.sendStatistic = function sendStatistic(data) 
{
  var m='';
  if (typeof data.eventName=='undefined'){
  return;
  }
  if (typeof this.cacheStatisticIndexes[data.id]=='undefined'){
  this.cacheStatisticIndexes[data.id]={};
  }
 if (typeof this.cacheStatisticIndexes[data.id][data.eventName]!='undefined'){
  return;
 }
 this.cacheStatisticIndexes[data.id][data.eventName]=1;
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.pid,affiliate_id:this.affiliate_id,cookie_id:this.cookieUserid,id_src:data.id,event:data.eventName,mess:m}; 
   var toURL="https://api.market-place.su/Product/video/l1stat.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
   //console.log([10008,preRemoteData]);
   var img = new Image(1,1);
   img.src = toURL;

  
};
discontext.prototype.sendPixel = function sendPixel(data) 
{
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.pid,affiliate_id:this.affiliate_id,id_src:data.id};
   var preToURL="http://widget2.market-place.su/admin/statistic/video/put?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData)); 
  var img = new Image(1,1);
  img.src =  preToURL; 
  return;
  
  
};
discontext.prototype.parseConfig = function parseConfig() 
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
};
discontext.prototype.start = function start() 
{
	var self= this;
	var c_data=this.parseConfig();
	if(typeof c_data.pid=='undefined')
	{
		c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	else
	{
		c_data.h1=unescape(c_data.h1);
	}
	this.pid=c_data.pid; 
	this.contextH1=c_data.h1; 
	this.affiliate_id=c_data.affiliate_id;
	function E1(obj){
	throw new Error(JSON.stringify(obj));
	}
    function S1(txt){
	var config=JSON.parse(txt); 

       self.links=config.ads;
		window.parent.postMessage(config,'*');
	   //self.links=[{"id":22,"src":"http://instreamvideo.ru/core/code.xml?wtag=apptoday&pid=7&vr=1&rid={rnd}&puid7=1&puid8=7&puid10=1&puid11=1&puid12=16&dl={ref}&duration=360&vn=nokia","priority":"123","title":"тест Инстрим","created_at":"2017-02-14 15:10:45","updated_at":"2017-02-14 15:25:16","pivot":{"id_block":"1","id_source":"22","prioritet":"0"}}];
	   
	   //console.log(JSON.stringify(self.links));
	   
	   config.contextH1=self.contextH1;
	   consoleLog([1,"контекстрое сообщение : "+config.contextH1]);
	   		    self.config=config;
        self.container=document.getElementById('container');
        if(typeof config.referer!='undefined'){
            self.referer=config.referer;
        }
        if(typeof config.width!='undefined'){

            self.container.style.width=config.width+"px";
        }
        if(typeof config.height!='undefined'){
            self.container.style.height=config.height+"px";
        }
	  //var self=this; 
	  function CallTracking(callback){
      self.contentFunc=callback;
      self.pushQueue(0);
      }
      //alert(self.container);
	   config.execCallback=CallTracking; 
	   if(typeof MpVideoWidget=='function'){
	     
	   new MpVideoWidget(config); 
	   }
	   //self.pushQueue(0);


    }
	c_data.errorFn=E1;
	c_data.successFn=S1;
	new Configurator(c_data);
 };
discontext.prototype.checkLoadedQueue = function checkLoadedQueue() {
 var x;
 for(x in  this.cacheloadedIndexes){
  if(this.cacheloadedIndexes[x]==0) return false; 
  console.log([3187744,x,this.cacheloadedIndexes[x]]);
 }
 return true;
};
discontext.prototype.pushQueue = function pushQueue(ind) {
  var self=this; 
   
   if(typeof this.links[ind]=='undefined'){
   
   
   consoleLog([3188,"массив 1 закончен на индексе /"+this.emptyStart+"/"+this.tmpPlayArCnt+"/ "+ind,this.queueToPlaySemaphore,this.currentIndexListen,this.queueToPlay,this.cacheloadedIndexes]); 
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
	var regex = /[?]([^=#]+)/g;
	//console.log([7,ind,self.links[ind].src]); 
	self.sendStatistic({id:self.links[ind].id,eventName:'srcRequest'});  
    this.player.loadNew(uri).then(function getLoad(res){
	 self.cacheloadedIndexes[ind]=1;
	 res.index=ind;
	 self.resourcesToPlay[ind]=res;
	 self.queueToPlay.push(ind);
	 console.log([31865,'goPlay!',self.links[ind].title]);
	 self.startPlayQueue();
	                   setTimeout(function() { 
					   self.pushQueue((ind+1));
					   }, 2000); 
	}).catch(function emitError(reason) {
    self.cacheloadedIndexes[ind]=3;
	var mess='';
	if(typeof reason.message != 'undefined'){
	mess=reason.message;
	//consoleLog([29,ind,self.links[ind].title,reason.message]);
	}
	else{

	
	}
	   console.log([31865,'goError!',self.links[ind].title,mess]); 
	   self.sendStatistic({id:self.links[ind].id,eventName:'srcLoadError',mess:mess});  
	   self.pushQueue((ind+1)); 
    });
 
}; 

discontext.prototype.changeIndex = function changeIndex(index) {
      if(typeof this.ListenedIndexes[index]!='undefined') return;
      this.ListenedIndexes[index]=1;
	    //alert('так всё стоп / '+this.links[index].title); 
	 // consoleLog([3185,index,'Переключение из!',this.links[index].title]);
	 				this.queueToPlaySemaphore=0;
			        this.startPlayQueue();
return false;
};

discontext.prototype.startPlayQueue = function startPlayQueue() {
this.emptyStart=1;
var self=this;
 if(this.queueToPlaySemaphore){ 
 	                   setTimeout(function() { 
					   self.startPlayQueue();
					   }, 200); 
 return; 
 }
 //console.log([3188,"индексы",this.queueToPlay.join(",")]);
 var index=this.queueToPlay.shift();

 if(typeof index=='undefined'){ 
 if(this.currentIndexListen && !this.queueToPlaySemaphore){ 
   //consoleLog([3188,"массив 2 закончен"]); 
   this.readyToPlayThird();
   }else{
   // consoleLog([3188,"массив 2 не закончен"]);   
   	setTimeout(function() { 
	self.startPlayQueue();
	}, 200); 
  }
  return; 
 }

// consoleLog([31866,'Load!',self.links[index].title]);
 var userid=CookieDriver.getUserID();
 var myPlayerSettings = CookieDriver.getObject(userid);
 if(!myPlayerSettings){
  myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
 }
 this.plSettings=myPlayerSettings;
 	  
 this.queueToPlaySemaphore=1;
 this.reporter=self.resourcesToPlay[index];
  this.player.once('AdError', function(reason) {
			  self.sendStatistic({id:self.links[index].id,eventName:'errorPlayMedia'}); 
			  consoleLog([3185,index,'Плеер ошибся в загрузку!',self.links[index].title,reason]); 
			  self.changeIndex(index);
              });
 		     this.clearExtraSlot();
		     this.container.innerHTML='';
 	  	     this.player.preparePlay(this.resourcesToPlay[index]).then(function startAd(){
		      consoleLog([31865,'Started!',self.links[index].title]);
			  self.player.once('AdError', function() {
			  self.sendStatistic({id:self.links[index].id,eventName:'errorPlayMedia'}); 
			  consoleLog([3185,index,'Плеер ошибся!',self.links[index].title]); 
			  //self.changeIndex(index);
              });
			  self.player.once('AdStopped', function() {
			
			  consoleLog([31869,'Плеер отыграл!',self.links[index].title]);
			  self.changeIndex(index);
			  });
			  self.createExtraSlot();
			  self.player.startAd().then(function f1(){
			   console.log(['плейер',self.plSettings]);
			    if(self.plSettings.mute){
		        self.player.adVolume=0;
		        }else{
		        self.player.adVolume=0.6;
	            }
				document.getElementById("container2").style.display="none";
				document.getElementById("container").style.display="block";
			  //self.player.adVolume=1;
			  consoleLog([31869,'Плеер заиграл!',self.player.adVolume,self.links[index].title]);
			  //self.sendPixel({id:self.links[index].id});
			  self.sendStatistic({id:self.links[index].id,eventName:'startPlayMedia'});
			  }).catch(function onError(e){
			    consoleLog([318666,'Плеер сдох!',e]);
			    self.changeIndex(index);
			  });
			  //self.queueToPlaySemaphore=0; 
			  //self.startPlayQueue();
	       }).catch(function onError(reason){
		       //self.sendStatistic({id:self.links[index].id,eventName:'errorPlayMedia'}); 
			   self.sendStatistic({id:self.links[ind].id,eventName:'srcLoadError'});  
			   consoleLog([31865,'Error загрузки !',index,self.links[index].title,reason]);
			   self.changeIndex(index);
		   });
 
};
discontext.prototype.readyToPlayThird = function readyToPlayThird() {

document.getElementById("container2").style.display="block";
document.getElementById("container").style.display="none";
this.contentFunc(); 
return;
      if(this.thirdPartyFlag){
	  return;
	  }
	  /*
	  var self=this; 
	  function CallTracking(callback){
      self.contentFunc=callback;
      self.Tracking(0);
      }
      this.config.contextH1=this.contextH1;
	  this.config.execCallback=CallTracking; 
	  if(typeof MpVideoWidget=='function'){
	  alert("готов заиграть или функция"); 
	  new MpVideoWidget(this.config); 
	  }
	  */
	  return;
	 //this.container.innerHTML='';
	 //this.container.style.display='none';
     //return;
this.thirdPartyFlag=1;
consoleLog([1,"готов играть твигл"]); 

consoleLog([1,this.container.innerHTML]); 	  
this.container.innerHTML='';  
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
discontext.prototype.checkDefaultTrailer = function checkDefaultTrailer(cnt) {


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
discontext.prototype.createTrailer=function(src) {
     this.container.innerHTML='';  
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
    // consoleLog([3444444444444444,mediafiles]);
	 var self=this;


 var userid=CookieDriver.getUserID();
 var myPlayerSettings = CookieDriver.getObject(userid);
 if(!myPlayerSettings){
  myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
 }
 this.plSettings=myPlayerSettings;
 

 
		 this.player.PlayMp4({mediafiles:mediafiles}).then(function startAd(player){
		    //consoleLog([545454545454,self.player.adVolume,self.plSettings.mute]); 
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
   CookieDriver.saveObject(self.plSettings,userid);
            //self.container.innerHTML='';  
			//self.container.style.display='none';
            };
			
	        }).catch(function onError(res){
			   console.log([454,701,'соравался',res]);  
		    }); 
   // this.player.PlayMp4({mediafiles:mediafiles});

};

module.exports = discontext;
			     