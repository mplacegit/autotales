window.colorTrailer = true; 
(function() {
    function async_load(z,args){

	      if(typeof window.MyMpWidgetsV=='undefined'){
		
		  }else{
		  return;
		  }
		  
    window.MyMpWidgetsV=1; 

    function myOnError(msg, url, lno) {
    //return true;
    }
	
	//window.colorPixels.start();
	try{
	
	function defaultFunctionReplay(config){

	window.colorPixels.overTvigle(); 

	}
	function parseConfig() 
    {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
    };
	var c_data=parseConfig();
	if(typeof c_data.pid=='undefined')
	{
		c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	else
	{
		c_data.h1=unescape(c_data.h1); 
	} 

	 var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
	 window.colorPixels = new multiDispatcher();
	 window.colorPixels.setConfig(config,defaultFunctionReplay);
     }});
	
	}catch(e){
	console.log(e.message);
	}finally {
	} 
    }
    var id="test";
	
	var myArgs={};
	 if (typeof window.attachEvent!='undefined')
        window.attachEvent('onload', function(){async_load(id,myArgs);});
     else
        window.addEventListener('load', function(){async_load(id,myArgs);}, false);
	 setTimeout( // если страница не заканчивается
     function(){
     async_load(id,myArgs);
     },
     5);

})(); 
