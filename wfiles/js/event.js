/* event based javascript routines*/
/* - Required dependancies: common.js 			 */
/*----------------------------------------------*/

/* Capture mouse movement and set MouseX and MouseY to its x,y corordinates */
var MouseX=0;
var MouseY=0;
var cursor = {x:0, y:0};
if(document.onmousemove){
	document.onmousemove = mouseMove;
	}
else if(document.addEventListener){
	/* Firefox model */
	document.addEventListener("mousedown",mouseMove,commonPassiveEventListener(false));
    document.addEventListener("mouseup",mouseMove,commonPassiveEventListener(false));
    document.addEventListener("mousemove",mouseMove,commonPassiveEventListener(false));
	}
else if(document.attachEvent){
	/* IE model */
	document.attachEvent("onmousedown",mouseMove);
    document.attachEvent("onmouseup",mouseMove);
    document.attachEvent("onmousemove",mouseMove);
	}
else if(document.captureEvents){document.captureEvents(Event.MOUSEDOWN | Event.MOUSEMOVE | Event.MOUSEUP);}


function eventBuildOnLoad() {
	if(document.readyState === "complete") {
		//console.log('eventBuildOnLoad ready');
  		eventProcessBuildOnLoad();
	}
	else {
		//console.log('eventBuildOnLoad not ready');
	  	if (window.addEventListener)  // W3C DOM
	        window.addEventListener("load",function(){eventProcessBuildOnLoad();},false);
	    else if (window.attachEvent) { // IE DOM
	         var r = window.attachEvent("onload", function(){eventProcessBuildOnLoad();});
	         return r;
	    }
	}
    
}
function eventProcessBuildOnLoad(){
	//console.log('eventProcessBuildOnLoad');
	let list=document.querySelectorAll('[data-onload]');
	for(let i=0;i<list.length;i++){
		if(undefined != list[i].getAttribute('data-onload-ex')){continue;}
		let str=list[i].getAttribute('data-onload');
		list[i].setAttribute('data-onload-ex',new Date().getTime());
		//console.log(str);
		let strfunc=new Function(str);
		strfunc();
	}
}

/**
* @describe enables drag n sort on child elements
* @param string - query selector string
* @return false
* @usage dragSortEnable('[data-behavior*="dragsort"]');
*/
function dragSortEnable(querystring) {
	let sortableLists = document.querySelectorAll(querystring);
	//console.log('dragSortEnable: '+querystring+' returned '+sortableLists.length+' results' );
	//console.log(sortableLists);
	Array.prototype.map.call(sortableLists, list => {dragSortEnableDragList(list);});
}
function dragSortEnableDragList(list) {
	Array.prototype.map.call(list.children, item => {dragSortEnableDragItem(item);});
}
function dragSortEnableDragItem(item) {
	item.setAttribute("draggable", true);
	item.ondrag = dragSortHandleDrag;
	item.ondragend = dragSortHandleDrop;
}
function dragSortHandleDrag(item) {
	//console.log('dragSortHandleDrag');
	//console.log(item);
	let selectedItem = item.target;
	let list = selectedItem.parentNode;
	let x = event.clientX;
	let y = event.clientY;
	selectedItem.classList.add("dragsort-active");
	let swapItem=document.elementFromPoint(x, y) === null?selectedItem:document.elementFromPoint(x, y);

	if (list === swapItem.parentNode) {
		swapItem=swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
		list.insertBefore(selectedItem, swapItem);
	}
}
function dragSortHandleDrop(item) {
	//console.log('dragSortHandleDrop');
	//console.log(item);
	item.target.classList.remove("dragsort-active");
}


/**
* @describe loads the contents of the text file into the element it is dropped on
* @param element object or id  - the element
* @return false
* @usage loadTextFileInit('sql_area');
*/
function loadTextFileInit(el){
	// Setup the dnd listeners.
	var loadTextFile = getObject(el);
	if(undefined == el){
		console.log('Error: invalid element',el);
		return;
	}
	loadTextFile.origBgcolor=loadTextFile.style.backgroundColor;
	addEventHandler(loadTextFile,"dragover",function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		//evt.dataTransfer.dropEffect = 'copy';
	});
	addEventHandler(loadTextFile,"dragenter",function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		//change bg color
		this.style.backgroundColor='#f0f0f0';
	});
	addEventHandler(loadTextFile,"dragexit",function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		//change bg color back
		this.style.backgroundColor=this.origBgcolor;
	});
	addEventHandler(loadTextFile,"drop",function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		this.style.backgroundColor=this.origBgcolor;
		// FileList object.
		var files = evt.dataTransfer.files;
		
		var obj=this;
		//check for text
		if(files.length == 0 && undefined != evt.dataTransfer.getData('text')){
			let txt=evt.dataTransfer.getData('text');
			let last=this.getAttribute('data-insert');
			if(txt.length && last != txt){
				this.setAttribute('data-insert',txt);
				//console.log('insertAtCursor:'+txt);
				insertAtCursor(this,txt);
			}
			return false;
		}
		// files is a FileList of File objects.
		for (var i=0;i<files.length;i++){
			var f=files[i];
			// Only process text files.
			if (!f.type.match('text.*')) {
				setText(this,'ERROR! '+f.name+' is not a text file');
				continue;
			}
			var reader = new FileReader();
			reader.targetObj=this;
			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
					setText(this.targetObj,e.target.result);
				};
			})(f);
			// Read in the file as text.
			reader.readAsText(f);
			loadTextFileInit(this);
			break;
		}
	});
}
function eventInitSticky(){
	//set table headers  to sticky
	var tlist=document.querySelectorAll('table.w_sticky');
	for(var t=0;t<tlist.length;t++){
		//get the top position of this table
		var tabletop=tlist[t].offsetTop;
		if(undefined != tlist[t].getAttribute('data-top')){
			tabletop=tlist[t].getAttribute('data-top');
		}
		//get the table thead th objects and set them to sticky
		var list=tlist[t].querySelectorAll('thead th');	
		for(var i=0;i<list.length;i++){
			list[i].style.position='sticky';
			list[i].style.top=tabletop+'px';
		}
	}
	
	//set anything that has w_sticky as a class
	list=document.querySelectorAll('.w_sticky');
	for(i=0;i<list.length;i++){
		//skip tables since we have already taken care of them above
		if(undefined != tlist[i].nodeName && tlist[i].nodeName=='TABLE'){
			continue;
		}
		else if(undefined != tlist[i].tagName && tlist[i].tagName=='TABLE'){
			continue;
		}
		t=list[i].offsetTop;
		list[i].style.position='sticky';
		list[i].style.top=t+'px';
	}
}
function marquee(id){
	//info: turns text in specified object or id into a scrolling marquee
	var mobj=getObject(id);
	if(undefined==mobj){return false;}
	var mid=mobj.id;
	clearTimeout(TimoutArray[id]);
	//get the attributes
	var attr=getAllAttributes(mobj);
	if(undefined == attr['m']){
		mobj.setAttribute('m',0);
		attr['m']=0;
	}
	//pause scrolling is mouse if over the area
	if (typeof(mobj.onmouseover) != 'undefined'){
		mobj.onmouseover=function(){
			this.setAttribute('m',1);
		};
		mobj.onmouseout=function(e){
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){
					this.setAttribute('m',0);
				}
			}
		};
	}
	if(undefined == attr['m'] || attr['m']===0){
		//get the text and determine its length
		var pxwh=getTextPixelWidthHeight(mobj);
		var mwh=getWidthHeight(mobj);
		//set timer default to 20 and allow override
		var timer=20;
		if(undefined != attr['timer']){speed=attr['timer'];}
		//set direction default to left and allow override
		var direction='left';
		if(undefined != attr['direction']){direction=attr['direction'];}
		//change position based on direction
		switch(direction.toLowerCase()){
			case 'left':
				//scroll right to left
				mobj.style.textAlign='right';
				mobj.style.whiteSpace='nowrap';
				mobj.style.paddingLeft='0px';
				if(undefined != mobj.style.paddingRight){
					x=mobj.style.paddingRight;
					if(x.length){
						x=x.replace('px','');
						x=parseInt(x,10);
					}
					else{
	                    	x=0;
					}
				}
				if(x < mwh[0]-pxwh[0]-2){
					mobj.style.paddingRight=parseInt(x+2,10)+'px';
				}
				else{
					mobj.style.paddingRight='0px';
				}
				break;
			case 'right':
				//scroll left to right
				mobj.style.textAlign='left';
				mobj.style.whiteSpace='nowrap';
				mobj.style.paddingRight='0px';
				if(undefined != mobj.style.paddingLeft){
					x=mobj.style.paddingLeft;
					if(x.length){
						x=x.replace('px','');
						x= parseInt(x,10);
					}
					else{
	                    	x=0;
					}
				}
				if(x < mwh[0]-pxwh[0]-2){
					mobj.style.paddingLeft=parseInt(x+2,10)+'px';
				}
				else{
					mobj.style.paddingLeft='0px';
				}
				break;
			default:
				return false;
				break;
		}
	}
	//set timeout to call it again in speed miliseconds
	TimoutArray[id] = setTimeout("marquee('"+id+"')",timer);
	return false;
}
function mouseMove(e) {
	if (!e){e = window.event;}
	if (e.pageX || e.pageY){
		cursor.x = e.pageX;
		cursor.y = e.pageY;
		}
	else if (e.clientX || e.clientY){
		if(document.body){
			if(document.documentElement){
				cursor.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				cursor.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
			}
		}
	/* set MouseX and MouseY for backward compatibility*/
	MouseY=cursor.y;
    MouseX=cursor.x;
    //window.status=MouseX+','+MouseY;
	}
function mp3Player(mp3,id,as){
	//info: creates flash object tags for mp3 player using niftyplayer.swf
	if(undefined == as){as=0;}
	var htm='';
	htm += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="165" height="38" id="niftyPlayer1" align="">'+"\n";
	htm += '<param name=movie value="/wfiles/niftyplayer.swf?file='+mp3+'&as='+as+'">'+"\n";
	htm += '<param name=quality value=high>'+"\n";
	htm += '<param name=bgcolor value=#FFFFFF>'+"\n";
	htm += '<embed src="/wfiles/niftyplayer.swf?file='+mp3+'&as='+as+'" quality=high bgcolor=#FFFFFF width="165" height="38" name="niftyPlayer1" align="" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">'+"\n";
	htm += '</embed>'+"\n";
	htm += '</object>'+"\n";
	setText(id,htm);
	}
function embedFlash(swf,param){
	if(undefined == param['width']){param['width']=400;}
	if(undefined == param['height']){param['height']=300;}
	if(undefined == param['bgcolor']){param['bgcolor']='#FFFFFF';}
	if(undefined == param['name']){param['name']='flashobj';}
	var htm='';
	htm += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" width="'+param['width']+'" height="'+param['height']+'" id="'+param['name']+'" align="">'+"\n";
	htm += '<param name=movie value="'+swf+'">'+"\n";
	htm += '<param name="quality" value="high">'+"\n";
	htm += '<param name="wmode" value="transparent">'+"\n";
	htm += '<param name="bgcolor" value="'+param['bgcolor']+'">'+"\n";
	htm += '<embed src="'+swf+'" wmode="transparent" quality="high" bgcolor="'+param['bgcolor']+'" width="'+param['width']+'" height="'+param['height']+'" name="'+param['name']+'" align="" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">'+"\n";
	htm += '</embed>'+"\n";
	htm += '</object>'+"\n";
	if(undefined != param['debug']){alert(htm);}
	if(undefined != param['popup'] && param['popup']==1){popUpDiv(htm,param);}
	else{
		setText(param['id'],htm);
		}
	}
/* make a div float */
function makeDivFloat(id, sx, sy){setFloatDiv(id, sx, sy).floatIt();}
var d=document;
var ns = (navigator.appName.indexOf("Netscape") != -1);
function setFloatDiv(id, sx, sy){
	var el=d.getElementById?d.getElementById(id):d.all?d.all[id]:d.layers[id];
	var px = document.layers ? "" : "px";
	window[id + "_obj"] = el;
	if(d.layers){el.style=el;}
	el.cx = el.sx = sx;el.cy = el.sy = sy;
	el.sP=function(x,y){this.style.left=x+px;this.style.top=y+px;};
	el.floatIt=function(){
		var pX, pY;
		pX = (this.sx >= 0) ? 0 : ns ? innerWidth :
		document.documentElement && document.documentElement.clientWidth?document.documentElement.clientWidth:document.body.clientWidth;
		pY = ns?pageYOffset : document.documentElement && document.documentElement.scrollTop?document.documentElement.scrollTop : document.body.scrollTop;
		if(this.sy<0){
			pY += ns ? innerHeight : document.documentElement && document.documentElement.clientHeight?document.documentElement.clientHeight : document.body.clientHeight;
			}
		this.cx += (pX + this.sx - this.cx)/8;this.cy += (pY + this.sy - this.cy)/8;
		this.sP(this.cx, this.cy);
		setTimeout(this.id + "_obj.floatIt()", 40);
		};
	return el;
	}
var changeState = new Array();
var changeValue = new Array();
var nicEditors = new Array();
var OnLoad = "";
//Schedule a Page Refresh
var schedulePageID='';
function schedulePageRefresh(page,div,opts,ms){
	var id='schedulePageRefresh';
	clearTimeout(TimoutArray[id]);
	//info: schedules a page refresh
	if(undefined == ms){ms=60000;}
	TimoutArray[id] = setTimeout('pageRefresh("'+page+'","'+div+'","'+opts+'")',ms);
    }
function scheduleAjaxGet(id,page,div,opts,ms,nosetprocess){
	//info: schedules a page refresh
	clearTimeout(TimoutArray[id]);
	if(undefined == ms){ms=60000;}
	if(undefined == nosetprocess){nosetprocess=0;}
	TimoutArray[id] = setTimeout('pageRefresh("'+page+'","'+div+'","'+opts+'",'+nosetprocess+')',ms);
    }
function pageRefresh(page,div,opts,nosetprocess){
	if(undefined == document.getElementById(div)){return false;}
	ajaxGet('/'+page,div,opts,'',60000,nosetprocess);
	return false;
}
// -- processMultiComboBox
function processMultiComboBox(tid,cid,tcnt,cm,showvalues){
     var tbox=document.getElementById(tid);
	var cbox=document.getElementById(cid);
	if(cm && cbox){
	     if(cbox.checked){cbox.checked = false;}
		else{cbox.checked = true;}
	}
	var list = GetElementsByAttribute('input','name',tid);
	var cnt=0;
	var val='';
	for(var i=0;i<list.length;i++){
		if(list[i].checked){
			if(showvalues){val += list[i].value+",";}
			cnt++;
		}
	}
	if(showvalues){tbox.value=val;}
	else{tbox.value=cnt+"/"+tcnt+" selected";}
}

//Determine if an objects value has changed
function setChangeState(tid){
     var el=document.getElementById(tid);
     changeState[tid]=el.value;
     }
function setChangeValue(tid,val){
     changeValue[tid]=val;
     }
function evalChange(tid){
	let jsfunc=new Function(changeValue[tid]);
    jsfunc();
}
function hasChanged(tid){
     var el=document.getElementById(tid);
     var changed=0;
     var val=el.value;
     var old=changeState[tid];
     if(val != old){changed++;}
     if(changed){return true;}
     return false;
     }
function iframePopup(url,opts){
	if(undefined == opts){opts=new Object;}
	var htm='';
	if(undefined == opts['iwidth']){opts['iwidth']=500;}
	if(undefined == opts['iheight']){opts['iheight']=300;}
	if(undefined == opts['iscrolling']){opts['iscrolling']='auto';}
	htm += '<div class="w_centerpop_title">'+opts['title']+'</div>'+"\n";
	htm += '<div class="w_centerpop_content" style="padding:0px;">'+"\n";
	htm += '<iframe seamless="1" src="'+url+'" width="'+opts['iwidth']+'" height="'+opts['iheight']+'" frameborder="0" marginwidth="0" marginheight="0" scrolling="'+opts['iscrolling']+'" align="center">Your browser does not support iframes.</iframe>';
	htm += '</div>'+"\n";
	centerpopDiv(htm,null,0);
	return false;
	}
function w_shareButton(url,t){
	window.open(url,'_blank','scrollbars=no, location=no, width=600, height=400, status=no, toolbar=no, menubar=no',false);
	return false;
}
function ajaxPopup(url,params,useropts){
	/* set default opt values */
	var pid='ajaxPopupDiv';
	var opt={
        id: pid,
        drag:1
		};
	/* allow user to override default opt values */
	if(useropts){
		var key;
		for (key in opt){
			if(undefined != useropts[key]){opt[key]=useropts[key];}
			}
		/* add additonal user settings to opt Object */
		for (key in useropts){
			if(undefined == opt[key]){opt[key]=useropts[key];}
			}
		}
	popUpDiv('<div class="w_bold w_lblue w_big"><img src="/wfiles/loading_blu.gif"> loading...please wait.</div>',opt);
	ajaxGet(url,opt['id']+'_Body',params);
	}
/* cancelBubble - stop propigation of events to that onclick events of the parent elements do not fire. */
function cancelBubble(e) {
 	var evt = e ? e:window.event;
 	if (evt.preventDefault){evt.preventDefault();}
	if (evt.stopPropagation){evt.stopPropagation();}
 	if (evt.cancelBubble !== null){evt.cancelBubble = true;}
}
/* centerpopDiv*/
function centerpopDiv(txt,rtimer,x){
	if(undefined == x){x='';}
	var divid='centerpop'+x;
	if(undefined != document.getElementById(txt)){txt=getText(txt);}
	var params={id:divid,drag:1,notop:1,nobot:1,noborder:1,nobackground:1,bodystyle:"padding:0px;border:0px;background:none;"};
	if(undefined != rtimer && rtimer > 0){
		params.showtime=rtimer;
    }
	popUpDiv('',params);
	setCenterPopText(divid,txt,{drag:true,close_bot:false});
	centerObject(divid);
	setStyle(divid,'zIndex','99999');
	return false;
}
/* tooltipDiv */
var tooltipDivObj='';
function tooltipDiv(obj,rtimer){
	if(undefined != commonFadeIdTimeouts['w_tooltip']){clearTimeout(commonFadeIdTimeouts['w_tooltip']);}
	obj=getObject(obj);
	if(tooltipDivObj==obj){return false;}
	tooltipDivObj=obj;
	let params={};
	params.position=obj.getAttribute('data-tooltip_position') || obj.getAttribute('data-tip_position') || '';
	let txt=obj.getAttribute('data-tooltip') || obj.getAttribute('data-tip') || '';
	if(txt.indexOf('id:')===0){
		//get tooltip text from an external div
    	let divid=trim(str_replace('id:','',txt));
    	txt=getText(divid) || '';
	}
	else if(txt.indexOf('js:')===0){
		//call a function
    	let f=trim(str_replace('js:','',txt));
    	let jsfunc=new Function(f);
    	txt=jsfunc();
	}
	else if(txt.indexOf('ajax:')===0){
		//call a function
    	params.ajax=trim(str_replace('ajax:','',txt));
    	txt='';
	}
	else if(txt.indexOf('att:')===0){
		//get tooltip from another attribute - att:alt for example
    	let att=trim(str_replace('att:','',txt));
    	txt=obj.getAttribute(att) || '';
	}
	if(txt.length === 0 || txt==='false' || !txt){txt=' ';}
	let cObj=getObject('w_tooltip');
	if(undefined != cObj){
		tooltipDivObj='';
		removeId(cObj);
	}
	if(undefined != rtimer){params.rtimer=rtimer;}
	showTooltip(obj,txt,params);
	return false;
}
function showTooltip(obj,txt,params){
	obj=getObject(obj);
	if(undefined==obj){return false;}
	if(undefined==params){params={};}
	if(undefined==params.position){
		if(obj.nodeName.toLowerCase()==='img'){
			params.position='bottom';	
		}
		else{
			params.position='right';
		}
	}
	let tipdiv=getObject('w_tooltip');
	if(undefined==tipdiv){
		tipdiv = document.createElement("div");
		tipdiv.setAttribute("id",'w_tooltip');
		tipdiv.style.zIndex='698999';
		tipdiv.style.position='absolute';
		document.body.appendChild(tipdiv);
	}
	//tipdiv.innerHTML=obj.nodeName+':'+txt;
	tipdiv.innerHTML=txt;
	let pos=findPos(obj);
	let x=y=h=w=th=0;
	h=obj.offsetHeight || obj.innerHeight || getHeight(obj) || 24;
	w=obj.offsetWidth || obj.innerWidth || getWidth(obj) || 24;
	th=tipdiv.offsetHeight || tipdiv.innerHeight || getHeight(tipdiv) || 24;
	tw=tipdiv.offsetWidth || tipdiv.innerWidth || getWidth(tipdiv) || 24;
	let viewport=getViewPort();
	//console.log('w='+w+', h='+h+', th='+th+', tw='+tw);
	if(params.position=='bottom'){
    	y=parseInt(pos.y)+h+6;
    	x=parseInt(pos.x);
	}
	else{
		//default to tip on right of image
        tipdiv.setAttribute("class",'left');
    	y=parseInt(pos.y);
    	x=parseInt(pos.x)+w+6;
    	//console.log('Initial: x='+x+', y='+y);
    	if(x+tw > parseInt(viewport.w)){
    		//x=parseInt(viewport.w)-tw-w-6;
    	}
	}
	//console.log('Final: x='+x+', y='+y);
	//console.log(viewport);
	tipdiv.style.top=y+"px";
    tipdiv.style.left=x+"px";
 	
 	if(undefined != params.ajax){
		ajaxGet(params.ajax,'w_tooltip');
	}
	return false;
}
/* popUpDiv */
function popUpDiv(content,param){
	//showProperties(param,'debug',1);
	/* set default opt values */
	var s="position:absolute;top:200px;left:200px;margin:5px;z-index:99999;";
	var bs="padding:5px;border:1px solid #d6dee7;background:#FFF;";
	clearTimeout('popupdiv_timeout');
	if(undefined != param['width']){
		s+='width:'+param['width']+'px;';
		}
	if(undefined != param['height']){bs+='height:'+param['height']+'px;overflow:auto;';}
	var opt={
        id: 'w' + new Date().getTime(),
        style: s,
        title: "",
        closestyle:"cursor:pointer;",
        close: '<span class="icon-cancel w_danger"></span>',
        bodystyle: bs,
        titleleft: 20,
        body: content
		};
	/* allow user to override default opt values */
	if(param){
		var key;
		for (key in opt){
			if(undefined != param[key]){opt[key]=param[key];}
			}
		/* add additonal user settings to opt Object */
		for (key in param){
			if(undefined == opt[key]){opt[key]=param[key];}
			}
		}
	//alert('opt:'+opt.timeout+', param:'+param.timeout);
	var masterdiv;
	if(undefined != document.getElementById(opt.id)){removeDiv(opt.id);}
	if(undefined != document.getElementById(opt.id)){
		masterdiv=document.getElementById(opt.id);
		//show if hidden
		var bodyid=opt.id+'_Body';
		masterdiv.style.display='block';
		if(undefined != document.getElementById(bodyid)){
			setText(bodyid,opt.body);
			}
		}
	else{
		masterdiv = document.createElement("div");
		masterdiv.setAttribute("id",opt['id']);
		masterdiv.style.zIndex='9999';
		masterdiv.style.position='absolute';
		var t  = document.createElement("table");
		t.border=0;
		t.align="left";
		t.cellPadding=0;
		t.cellSpacing=0;
		if(undefined != opt['width']){
			t.style.width=opt['width']+'px';
			}
		//bgcolor
	    var bgcolor='#49495a';
	    if(opt.titlebgcolor){bgcolor=opt.titlebgcolor;}
	    else if(param.titlebgcolor){bgcolor=param.titlebgcolor;}
	    //Table border
	    if(undefined == param['noborder']){
			t.style.border='1px solid '+bgcolor;
			}
		else{
			t.style.border='0px solid '+bgcolor;
        	}
		//body - begin
	    var tb = document.createElement("tbody");
	    if(undefined == param['notop']){
		    //title row - begin
		    var toprow = document.createElement("div");
		    //titlecell
		    var titlecell = document.createElement("td");
		 	//title
		    titlecell.noWrap = true;
		    titlecell.align='right';
		    titlecell.style.fontFamily='arial';
		    titlecell.style.fontSize='11px';
			titlecell.style.backgroundColor=bgcolor;
			//color
			if(opt.titlecolor){
				titlecell.style.color=opt.titlecolor;
				}
			else{titlecell.style.color='#FFFFFF';}
			var titlediv = document.createElement("div");
		    var titletxt='<div id="'+opt['id']+'_Title'+'" style="float:left;margin-left:10px;margin-top:1px">'+opt['title']+'</div>';
		    //add close div
		    titletxt += '<a href="#" style="font-weight:bold;font-size:12px;font-family:arial;color:#970000;text-decoration:none;padding:0 3px 0 0;" onclick="ajaxAbort(\''+opt['id']+'\',1);return false;">X</a>';
		    titlediv.innerHTML=titletxt;
		    titlecell.appendChild(titlediv);
		    toprow.appendChild(titlecell);
			tb.appendChild(toprow);
			}
		//top row - end

		//Body row - begin
	    var bodyrow = document.createElement("tr");
	    bodyrow.height='100%';
	    var bodycell = document.createElement("td");
	    if(undefined == param['nobackground']){
	    	bodycell.style.backgroundColor='#FFFFFF';
			}
	    var bodydiv = document.createElement("div");
	    var bodycontent = '<div id="'+opt['id']+'_Body'+'">'+opt.body;
		bodycontent += '</div>';
	    bodydiv.innerHTML=bodycontent;
	    bodycell.appendChild(bodydiv);
	    bodyrow.appendChild(bodycell);
		tb.appendChild(bodyrow);
		//body row - end
		if(undefined == param['nobot']){
			//bottom close row
		    var botrow = document.createElement("tr");
		    var botcell = document.createElement("td");
		    botcell.noWrap = true;
		    botcell.align='right';
		    botcell.style.fontFamily='arial';
		    botcell.style.fontSize='11px';
		    bgcolor='#FFFFFF';
	    	if(opt.botbgcolor){bgcolor=opt.botbgcolor;}
	    	else if(param.botbgcolor){bgcolor=param.botbgcolor;}
		    botcell.style.backgroundColor=bgcolor;
			var botdiv = document.createElement("div");
		    //add close div
		    var bottxt = '<a href="#" class="w_red w_bold w_link"" onclick="ajaxAbort(\''+opt['id']+'\',1);return false;">Close</a>';
		    botdiv.innerHTML=bottxt;
		    botcell.appendChild(botdiv);
		    botrow.appendChild(botcell);
			tb.appendChild(botrow);
			}

		//allow body to be resized
		//addDragToTextarea(opt['id']+'_Body');

		//body -end
	    t.appendChild(tb);

		masterdiv.style.display='block';
	    //append table to masterdiv
	    masterdiv.appendChild(t);
	    if(opt.drag && undefined == param['notop']){
			Drag.init(titlediv,masterdiv);
			titlediv.style.cursor='move';
	        }
	    //append to document body
	    document.body.appendChild(masterdiv);
    	}

    /* check for center option */
    masterdiv.style.display='block';
    if(opt.center){
		var xy=centerObject(masterdiv);
		var x=0;
		var y=0;
		var cvalue=opt.center+'';
		if(cvalue.indexOf('x') != -1){
			//only center x - make y MouseY
			x=xy[0];
        	}
        else if(cvalue.indexOf('y') != -1){
			//only center y - make x MouseX
			y=xy[1];
        	}
        else{
			x=xy[0];
			y=xy[1];
        	}
        //check for x and y
		if(undefined != opt.x){
			//if x begins with a + or -, then add it
			xvalue=opt.x+'';
			if(xvalue.indexOf('+') != -1){x=Math.round(MouseX+parseInt(xvalue,10));}
			else if(xvalue.indexOf('-') != -1){x=Math.round(MouseX-Math.abs(parseInt(xvalue,10)));}
			else{x=Math.round(opt.x);}
			if(x < 0){x=0;}
			}
		if(undefined != opt.y){
			//if y begins with a + or -, then add it
			yvalue=opt.y+'';
			if(yvalue.indexOf('+') != -1){y=Math.round(MouseY+parseInt(yvalue,10));}
			else if(yvalue.indexOf('-') != -1){y=Math.round(MouseY-Math.abs(parseInt(yvalue,10)));}
			else{y=Math.round(opt.y);}
			if(y < 0){y=0;}
			}
		if(x < 0){x=0;}
		if(y < 0){y=0;}
		//alert(x+','+y);
		masterdiv.style.position='absolute';
		masterdiv.style.left=x+"px";
		masterdiv.style.top=y+"px";
		}
	/* check for botright option */
	else if(param.topright){
		masterdiv.style.position='absolute';
		masterdiv.style.top=param.topright+"px";
		masterdiv.style.right=param.topright+"px";
		}
	/* check for botleft option */
	else if(param.topleft){
		masterdiv.style.position='absolute';
		masterdiv.style.top=param.topleft+"px";
		masterdiv.style.left=param.topleft+"px";
		}
	/* check for botright option */
	else if(param.botright){
		masterdiv.style.position='absolute';
		masterdiv.style.bottom=param.botright+"px";
		masterdiv.style.right=param.botright+"px";
		}
	/* check for botleft option */
	else if(param.botleft){
		masterdiv.style.position='absolute';
		masterdiv.style.bottom=param.botleft+"px";
		masterdiv.style.left=param.botleft+"px";
		}
	else if(opt.screen){
		showOnScreen(masterdiv);
     	}
    else if(opt.mouse){
        x=0;
		y=0;
		cvalue=opt.mouse+'';
		if(cvalue.indexOf('x') != -1){
			//only center x - make y MouseY
			x=MouseX;
        	}
        else if(cvalue.indexOf('y') != -1){
			//only center y - make x MouseX
			y=MouseY;
        	}
		//check for x and y
		if(undefined != opt.x){
			//if x begins with a + or -, then add it
			xvalue=opt.x+'';
			if(xvalue.indexOf('+') != -1){x=Math.round(MouseX+parseInt(xvalue,10));}
			else if(xvalue.indexOf('-') != -1){x=Math.round(MouseX-Math.abs(parseInt(xvalue,10)));}
			else{x=MouseX;}
			}
		if(undefined != opt.y){
			//if y begins with a + or -, then add it
			yvalue=opt.y+'';
			if(yvalue.indexOf('+') != -1){y=Math.round(MouseY+parseInt(yvalue,10));}
			else if(yvalue.indexOf('-') != -1){y=Math.round(MouseY-Math.abs(parseInt(yvalue,10)));}
			else{y=MouseY;}
			}
		//window.status=x+','+y;
		if(x < 0){x=0;}
		if(y < 0){y=0;}
    	masterdiv.style.top=y+"px";
    	masterdiv.style.left=x+"px";
    	}
    else{
		if(undefined != opt.x){masterdiv.style.left=opt.x+"px";}
		if(undefined != opt.y){masterdiv.style.top=opt.y+"px";}
    	}
    if(opt.showtime){
		//remove the div if mouse is not in the div,
		//	otherwise until after they have moved mouse out and timeout has expired.
		t=Math.round(opt.showtime*1000);
		popupdiv_timeout=setTimeout("removeDivOnExit('"+opt.id+"',1)",t);
    	}
    else if(opt.fade){
		masterdiv.onmouseout=function(e){
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){
					//alert('mouse left - 1');
					fadeId(this.id,1);
					}
				}
			//else{fadeId(this.id,1);}
			};
    	}
}
function createTable(){
	var t  = document.createElement("table");
    tb = document.createElement("tbody");
    t.setAttribute("border","1");
    var tr = document.createElement("tr");
    var td ;
    var d;
	d = document.createElement("div");
    d.style.backgroundColor = "red";
    d.style.minHeight = "20px";
    d.style.width = "50px";
    td = document.createElement("td");
    td.appendChild(d);

    tr.appendChild(td);
	d = document.createElement("div");
    d.style.backgroundColor = "green";
    d.style.minHeight = "20px";
    d.style.width = "50px";
    td = document.createElement("td");
    td.appendChild(d);
    tr.appendChild(td);
	tb.appendChild(tr);
    t.appendChild(tb);
    //alert(t);
    document.getElementById("ajaxstatus").appendChild(t);

 }
function removeDiv(divid){
	//info: removes specified id
	return removeId(divid);
	}
function removeId(divid){
	//info: removes specified id
	var obj=getObject(divid);
	if(undefined == obj){return false;}
	try{
		obj.remove();
		if(undefined == obj){return true;}
	}
	catch(e){}
	try{
		if(undefined != obj.parentNode){
			obj.parentNode.removeChild(obj);
			if(undefined == obj){return true;}
		}
	}
	catch(e){}
	try{
		document.body.removeChild(obj);
    	if(undefined == obj){return true;}
	}
	catch(e){}
	try{
		document.getElementsByTagName('BODY')[0].removeChild(obj);
    	if(undefined == obj){return true;}
	}
	catch(e){}
	try{
    	obj.parentNode.removeChild(obj);
    	if(undefined == obj){return true;}
	}
	catch(e){}
    return false;
}
function removeDivOnExit(divid,fade){
	//info: removes specified id when the mouse cursor exits the area
	var obj=getObject(divid);
	if(undefined == obj){return;}
	if(!isMouseOver(divid)){
		//alert('mouse left - 2:'+divid);
		if(undefined != fade && fade==1){
			fadeId(divid,1);
			}
		else{removeDiv(divid);}
		return;
		}
	if(undefined != fade && fade==1){
		obj.onmouseout=function(e){
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){
					//alert('mouse left - 3');
					fadeId(this.id,1);
					}
				}
			//else{fadeId(this.id,1);}
			};
		}
	else{
		obj.onmouseout=function(e){
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){
					removeDiv(this.id);
					}
				}
			//else{removeDiv(this.id);}
			}
		};
	}
/* isMouseOver - returns true the mouse if over this object*/
function isMouseOver(id){
	//info: returns true the mouse if over this object
	var exy = getXY(id);
	if(undefined == exy){return true;}
	var ewh = getWidthHeight(id);
	//alert(MouseX+','+MouseY);
	//showProperties(exy);
	//showProperties(ewh);
	if (MouseX >= exy[0] && MouseX <= exy[0]+ewh[0] && MouseY >= exy[1] && MouseY <= exy[1]+ewh[1]){return true;}
	return false;
	}
function getChildById(obj, id) {
	if (obj.id == id){return obj;}
	if (obj.hasChildNodes()) {
		for (var i=0; i<obj.childNodes.length; i++) {
			var child = getChildById(obj.childNodes[i], id);
			if (child !== null){return child;}
			}
		}
	return null;
	}
/* centerObject */
function setObjectPos(obj,x,y){
	var sObj=getObject(obj);
	if(undefined == sObj){return false;}
	if(undefined == x){x=MouseX || 10;}
	if(undefined == y){y=MouseY || 10;}
  	sObj.style.position='absolute';
  	sObj.style.left=x+'px';
  	sObj.style.top=y+'px';
  	return new Array(x,y);
	}
/* centerObject */
function centerObject(obj,fade){
	//info: centers specified object or id
	if(undefined == fade){fade=0;}
	let sObj=getObject(obj);
	if(undefined == sObj){return false;}
	let w=sObj.offsetWidth || sObj.innerWidth || getWidth(sObj) || 100;
	let h=sObj.offsetHeight || sObj.innerHeight || getHeight(sObj) || 100;
	let vp=getViewportSize();
	//window.status=obj+':'+w+','+h;
	//var whx=getWidthHeight(sObj);
	//window width and height
	//var ww=getViewportWidth();
	//var wh=getViewportHeight();
	//scroll width and height
	//var sw=getScrollWidth();
	//var sh=getScrollHeight();
	let x = Math.round((vp.w / 2) - (w / 2));
  	let y = Math.round((vp.h / 2) - (h / 2));
  	//window.status='centerObject: '+sObj.id+' w,h:'+w+','+h+' window:'+ww+','+wh+',scroll:'+sw+','+sh+','+x+','+y;
  	sObj.style.position='fixed';
  	sObj.style.left=x+'px';
  	if(undefined == y){y=10;}
	if(y < 10){y=10;}
  	sObj.style.top=y+'px';
  	if(fade==1){
    	sObj.onmouseout=function(e){
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){fadeId(this.id,1);}
			}
		};
	}
  	return new Array(x,y);
	}
/* hideOnExit */
function hideOnExit(obj){
	//info: hides specified id when the mouse cursor exits the area
	var sObj=getObject(obj);
	if(undefined == sObj){return false;}
	sObj.onmouseout=function(e){
		if(undefined == e){e = fixE(e);}
		if(undefined != e){
			if(checkMouseLeave(this,e)){
				this.style.display='none';
			}
		}
	};
	return false;
}
/* showOnScreen */
function showOnScreen(obj){
	//info: forces placement of object on screen
	var sObj=getObject(obj);
	if(undefined == sObj){return false;}
	//if(sObj.style.display=='block'){return true;}
	//if the object is set to display:none it will have a 0 width and height - visibility lets us capture w and h
	sObj.style.position='absolute';
	sObj.style.visibility='hidden';
	sObj.style.display='block';
	//get object's width and height
	var w=sObj.offsetWidth || sObj.innerWidth|| getWidth(sObj) || 100;
	var h=sObj.offsetHeight || sObj.innerHeight || getHeight(sObj) || 100;
	//get screen width and height
	var screen=getViewPort();
	var sw=getWidth();
	var sh=getHeight();
	//get cursor position
	var x=cursor.x;
	var y=cursor.y;
	/* set x */
	if(x+w+20 > sw){
		var z=x-w;
		while(z < 0){z++;}
		x = z;
		}
	/* set y */
	if(y+h+20 > sh){
		z=y-h;
		while(z < 0){z++;}
		y = z;
		}
	//set object's new position
	sObj.style.left=x+'px';
  	sObj.style.top=y+'px';
  	sObj.style.visibility='visible';
  	return new Array(x,y);
   	}
/*getViewPort - Space within the browser window is known as the 'viewport' */
function getViewPort(){
	let viewport={};
	if (typeof window.innerWidth != 'undefined')
	 {
	      viewport.w = window.innerWidth;
	      viewport.h = window.innerHeight;
	 }

	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)

	 else if (typeof document.documentElement != 'undefined' 
	     && typeof document.documentElement.clientWidth !=
	     'undefined' && document.documentElement.clientWidth != 0)
	 {
	       viewport.w = document.documentElement.clientWidth;
	       viewport.h = document.documentElement.clientHeight;
	 }

	 // older versions of IE

	 else{
	       viewport.w = document.getElementsByTagName('body')[0].clientWidth;
	       viewport.h = document.getElementsByTagName('body')[0].clientHeight;
	 }
  return viewport;
}
// Menu function to assign hover to li and hide w_select select tags on hover
sfHover = function() {
	//assign hover to li and hide w_select select tags on hover
	var navEls = GetElementsByAttribute('ul', 'id', 'w_nav');
	for (var n=0; n<navEls.length; n++){
		var sfEls = navEls[n].getElementsByTagName("LI");
		for (var i=0; i<sfEls.length; i++){
			sfEls[i].onmouseover=function(){
				this.className="sfhover";
				};
			sfEls[i].onmouseout=function(){
				this.className="";
				};
			}
		}
	};
// Add sfHover to the onLoad queue
addEventHandler(window,'load',sfHover);
var calledStickyMenus=0;
function initCarousels(){
	let list=document.querySelectorAll('.w_carousel');
	for(let i=0;i<list.length;i++){
		//if the active one is the first one then do not show prev icon
		if(undefined != list[i].getAttribute('initialized')){continue;}
		list[i].setAttribute('initialized',1);
		let e=document.createElement('span');
		e.className="icon-arrow-right w_carousel_next";
		e.onclick=function(){
			//get the next child
			let list=this.parentNode.querySelectorAll('.slide');
			//console.log(list);
			for(let i=0;i<list.length;i++){
				if(list[i].className.indexOf('active') != -1){
					//console.log(i,'is active');
					removeClass(list[i],'active');
					let n=i+1;
					if(undefined != list[n]){
						//console.log('setting active',n);
						addClass(list[n],'active');
					}
					else{
						//console.log('setting active',0);
						addClass(list[0],'active');
					}
					break;
				}
			}
		}
		list[i].appendChild(e);
	}
}
function initDisplayif(){
	let els=document.querySelectorAll('form [data-displayif]');
	//console.log('initDisplayif: '+els.length);
	for(let i=0;i<els.length;i++){
		let frm=getParent(els[i],'form');
		if(undefined != frm){
			if(undefined == frm.getAttribute('onchange')){
				frm.setAttribute('onchange','formChanged(this);');
			}
			//initial call
			formChanged(frm);
		}
	}
}
/* set custom required message using data-required_msg in form fields */
function initCustomValidity(){
	let els = document.querySelectorAll('textarea[data-required_msg],input[data-required_msg],select[data-required_msg]');
    	for (let i = 0; i < els.length; i++) {
        els[i].oninvalid = function(e) {
            e.target.setCustomValidity('');
            if (!e.target.validity.valid) {
                e.target.setCustomValidity(this.dataset.required_msg);
            }
        };
        els[i].oninput = function(e) {
            e.target.setCustomValidity('');
        };
    }
    els = document.querySelectorAll('input[data-pattern_msg]');
    	for (let i = 0; i < els.length; i++) {
        els[i].oninvalid = function(e) {
            e.target.setCustomValidity('');
            if (!e.target.validity.valid) {
                e.target.setCustomValidity(this.dataset.pattern_msg);
            }
        };
        els[i].oninput = function(e) {
            e.target.setCustomValidity('');
        };
    }
}
function initQuill(){
	let quills=document.querySelectorAll('textarea[data-behavior="quill"],textarea[data-behavior="richtext"],textarea[data-behavior="nicedit"]');
	//console.log(quills.length);
	for(i=0;i<quills.length;i++){
		if(undefined != quills[i].processed){continue;}
		quills[i].processed=1;
		let qdiv=document.createElement('div');
		quills[i].insertAdjacentElement('afterEnd',qdiv);
		quills[i].style.display='none';
		let toolbarOptions=new Array();
		//allow the user to define what toolbar options are there
		if(undefined == quills[i].dataset.toolbar){
			toolbarOptions.push(
	            'bold', 'italic', 'underline', 'strike',        // toggled buttons
	            'blockquote', 'code-block',
	            { 'header': 1 }, { 'header': 2 },               // custom button values
	            { 'list': 'ordered'}, { 'list': 'bullet' },
	            { 'align': [] },
	            { 'script': 'sub'}, { 'script': 'super' },      // superscript/subscript
	            { 'indent': '-1'}, { 'indent': '+1' },          // outdent/indent
	            { 'direction': 'rtl' },                         // text direction
	            { 'size': ['small', false, 'large', 'huge'] },  // custom dropdown
	            { 'header': [1, 2, 3, 4, 5, 6, false] },
	             'image', 'attach' ,          					// add's image support
	            { 'color': [] }, { 'background': [] },          // dropdown with defaults from theme
	            { 'font': [] },
	            'clean'                                       // remove formatting button
	        );
		}
		else{
			let bars=quills[i].dataset.toolbar.split(/[ ,]+/);
			for(let b=0;b<bars.length;b++){
				switch(bars[b].toLowerCase()){
					case 'h1':toolbarOptions.push({ 'header': 1 });break;
					case 'h2':toolbarOptions.push({ 'header': 2 });break;
					case 'background':toolbarOptions.push({ 'background': [] });break;
					case 'color':toolbarOptions.push({ 'color': [] });break;
					case 'font':toolbarOptions.push({ 'font': [] });break;
					case 'header':toolbarOptions.push({ 'header': [1, 2, 3, 4, 5, 6, false] });break;
					case 'size':toolbarOptions.push({ 'size': ['small', false, 'large', 'huge'] });break;
					case 'direction':toolbarOptions.push({ 'direction': 'rtl' });break;
					case 'ol':toolbarOptions.push({ 'list': 'ordered'});break;
					case 'ul':toolbarOptions.push({ 'list': 'bullet'});break;
					case 'align':toolbarOptions.push({ 'align': [] });break;
					case 'sub':toolbarOptions.push({ 'script': 'sub'});break;
					case 'sup':toolbarOptions.push({ 'script': 'super'});break;
					case 'outdent':toolbarOptions.push({ 'indent': '-1'});break;
					case 'indent':toolbarOptions.push({ 'indent': '+1'});break;
					case 'bold':
					case 'italic':
					case 'underline':
					case 'strike':
					case 'blockquote':
					case 'code-block':
					case 'link':
					case 'image':
					case 'video':
					case 'clean':
					case 'attach':
						toolbarOptions.push(bars[b].toLowerCase());
					break;
				}
			}
		}
	    let myquill = new Quill(qdiv, {
	        modules: {
	            toolbar: toolbarOptions
	        },
	        theme: 'snow'
	    });
	    //toolbar
	    let toolbar = myquill.getModule('toolbar');
	    //attach
		
		//toolbar.addHandler('omega', this.fileHandler.bind(this));
	    //add titles
	    let attach=document.querySelector('button.ql-attach');
	    if(undefined != attach){
	    	attach.setAttribute('title','Attachment');
	    	let fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.classList.add('ql-attach');
            fileInput.addEventListener('change', function () {
            	if (fileInput.files != null && fileInput.files[0] != null) {
                	let reader = new FileReader();
                	reader.filename=fileInput.files[0].name;
                	reader.onload = function (e) {
                  		let range = myquill.getSelection(true);
                  		let img = Quill.import('formats/image');
						img.className = 'ql-attachment';
						Quill.register(img, true);
						let fname=this.filename;
        				myquill.insertEmbed(range.index||0, 'image',this.result,'user');
        				//change back
        				img.className = 'ql-image';
						Quill.register(img, true);
                  		fileInput.value = "";
                  		decorateQuillAttachments(fname);
                	};
                	reader.readAsDataURL(fileInput.files[0]);
              	}
            });
            toolbar.container.appendChild(fileInput);
            attach.file=fileInput;
	    	attach.onclick=function(){
	    		this.file.click();
	  		};
	    }
	    for(let i=0;i<toolbar.controls.length;i++){
	    	let name=toolbar.controls[i][0]
	    	let ctrl=toolbar.controls[i][1];
	    	switch(name.toLowerCase()){
	    		case 'header':
	    			ctrl.setAttribute('title','H'+ctrl.value);
	    		break;
	    		case 'indent':
	    			if(ctrl.value=='+1'){
	    				ctrl.setAttribute('title','Indent');
	    			}
	    			else{
	    				ctrl.setAttribute('title','Outdent');
	    			}
	    		break;
	    		case 'direction':
	    			ctrl.setAttribute('title','Direction: '+ctrl.value);
	    		break;
	    		default:
	    			ctrl.setAttribute('title',ctrl.value||name);
	    		break;
	    	}	
	    }
	    //update the data
	    if(quills[i].innerText.length){
		    const delta = myquill.clipboard.convert(quills[i].innerText);
			myquill.setContents(delta, 'silent');
		}
	    myquill.textarea=quills[i];
	    myquill.on('text-change', function(delta, source) {
	    	myquill.textarea.innerHTML='<div class="ql-editor ql-snow">'+myquill.root.innerHTML+'</div>';
		});
	}
	decorateQuillAttachments();
}
/* initSpinWheel */
function initSpinWheel(){
  let wheels=document.querySelectorAll('select[data-behavior="spinwheel"]');
  if(undefined == wheels || wheels.length==0){return false;}
  const rand = (m, M) => Math.random() * (M - m) + m;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
  let angVel = 0; // Angular velocity
  let ang = 0; // Angle in radians
  let colors = ['#e70697', '#fff200', '#f6989d', '#ee1c24', '#3cb878','#f26522','#a186be','#00aef0'];
  let isw=this;
  for(let w=0;w<wheels.length;w++){
  	//already initialized?
  	if(undefined != wheels[w].dataset.initialized){continue;}
  	wheels[w].dataset.initialized=1;
    //data-colors?
    if(undefined != wheels[w].dataset.colors){
      wcolors=wheels[w].dataset.colors.split(',');
    }
    else{
      wcolors=colors;
    }
    //audio
    wheels[w].audiofile=wheels[w].dataset.audio||'/wfiles/tick.mp3';
    wheels[w].audio=new Audio(wheels[w].audiofile);
    //wrapper
    let width_height=wheels[w].dataset.width||wheels[w].dataset.height||300;
    wheels[w].wrapper=document.createElement('div');
    wheels[w].wrapper.setAttribute('class','spinwheel');
    wheels[w].wrapper.setAttribute('style','width:'+width_height+'px;height:'+width_height+'px;');
    wheels[w].wrapper.dataset.wheel_index=w;
    //displayif
    if(undefined != wheels[w].dataset.displayif){
    	wheels[w].wrapper.displayif=wheels[w].dataset.displayif;
    }
    wheels[w].parentNode.insertBefore(wheels[w].wrapper, wheels[w].nextSibling);
    //canvas
    wheels[w].canvas=document.createElement('canvas');
    wheels[w].canvas.setAttribute('width',width_height);
    wheels[w].canvas.setAttribute('height',width_height);
    wheels[w].ctx = wheels[w].canvas.getContext('2d');
    wheels[w].wrapper.appendChild(wheels[w].canvas);
    wheels[w].canvas.dataset.wheel_index=w;
    //spin button
    wheels[w].button=document.createElement('button');
    wheels[w].button.setAttribute('class','spin');
    wheels[w].button.setAttribute('type','button');
    wheels[w].button.textContent=wheels[w].dataset.button_text||'spin';
    wheels[w].button.style.background=wheels[w].dataset.button_background||'#fff';
    wheels[w].button.style.color=wheels[w].dataset.button_color||'#000';
    if(width_height <= 100){
      wheels[w].button.style.font='0.7em/0 sans-serif';
    }
    else if(width_height <= 200){
      wheels[w].button.style.font='1.0em/0 sans-serif';
    }
    else if(width_height <= 300){
      wheels[w].button.style.font='1.3em/0 sans-serif';
    }
    else{
      wheels[w].button.style.font='1.5em/0 sans-serif';
    }
    wheels[w].button.dataset.wheel_index=w;
    wheels[w].button.addEventListener("click", clicked,false);
    wheels[w].wrapper.appendChild(wheels[w].button);
    
    //build the sectors
    wheels[w].sectors=new Array();
    let c=0;
    for(let i=0;i<wheels[w].options.length;i++){
    	 if(trim(wheels[w].options[i].value).length==0){continue;}
      let label=trim(wheels[w].options[i].text);
      if(label.length==0){continue;}
      let value=trim(wheels[w].options[i].value) || label;
      let sector={label:label,color:wcolors[c],value:value};
      wheels[w].sectors.push(sector);
      c=c+1;
      if(undefined == wcolors[c]){c=0;}
    }
    //draw the sectors
    wheels[w].tot = wheels[w].sectors.length;
    wheels[w].dia = wheels[w].ctx.canvas.width;
    wheels[w].rad = wheels[w].dia / 2;
    wheels[w].arc = TAU / wheels[w].sectors.length;
    wheels[w].angVel=0;
    wheels[w].volume=0;
    let font=wheels[w].dataset.font||'bold 20px sans-serif';
    let fillstyle=wheels[w].dataset.fillstyle||'#000';
    let textalign=wheels[w].dataset.textalign||'right';
    //console.log(new Array(w,fillstyle,textalign,font));
    for(let s=0;s<wheels[w].sectors.length;s++){
      wheels[w].ang = wheels[w].arc * s;
      wheels[w].ctx.save();
      // COLOR
      wheels[w].ctx.beginPath();
      wheels[w].ctx.fillStyle = wheels[w].sectors[s].color;
      wheels[w].ctx.moveTo(wheels[w].rad, wheels[w].rad);
      wheels[w].ctx.arc(wheels[w].rad, wheels[w].rad, wheels[w].rad, wheels[w].ang, wheels[w].ang + wheels[w].arc);
      wheels[w].ctx.lineTo(wheels[w].rad, wheels[w].rad);
      wheels[w].ctx.fill();
      // TEXT
      wheels[w].ctx.translate(wheels[w].rad, wheels[w].rad);
      wheels[w].ctx.rotate(wheels[w].ang + wheels[w].arc / 2);
      wheels[w].ctx.textAlign = textalign;
      wheels[w].ctx.fillStyle = fillstyle;
      wheels[w].ctx.font = font;
      wheels[w].ctx.fillText(wheels[w].sectors[s].label, wheels[w].rad - 10, 10);
      //restore
      wheels[w].ctx.restore();
    }
  }
  function clicked(evt){
    let w=parseInt(evt.currentTarget.dataset.wheel_index);
    if(undefined==wheels[w].dataset.clicked){
      wheels[w].dataset.clicked=1;
    }
    else{
      wheels[w].dataset.clicked=parseInt(wheels[w].dataset.clicked)+1;
    }
    if(undefined != wheels[w].dataset.max){
      let max=parseInt(wheels[w].dataset.max);
      if(wheels[w].dataset.clicked > max){
        return false;
      }
    }
    wheels[w].angVel = rand(0.25, 0.35);
    return false;
  }
  function rotate(w) {
    //get the sector on top
    let s=Math.floor(wheels[w].tot -wheels[w].ang / TAU * wheels[w].tot) % wheels[w].tot;
    let sector = wheels[w].sectors[s];
    wheels[w].canvas.style.transform = `rotate(${wheels[w].ang - PI / 2}rad)`;
    let label = !wheels[w].angVel ? sector.label : sector.label;
    if(undefined == wheels[w].label || wheels[w].label != label){
      playSound(w);
      wheels[w].label=label;
      wheels[w].value=sector.value;
      wheels[w].button.textContent = label;
      wheels[w].button.style.background = sector.color;
    }
  }
  function frame() {
    for(w in wheels){
      if(!isNum(w)){continue;}
      if(wheels[w].angVel==0){continue;}
      wheels[w].angVel *= friction; // Decrement velocity by friction
      // Bring to stop
      if (wheels[w].angVel < 0.002){
        wheels[w].angVel = 0;
        wheels[w].volume=0;
        simulateEvent(wheels[w],'change');
      }
      wheels[w].ang += wheels[w].angVel; // Update angle
      wheels[w].ang %= TAU; // Normalize angle
      rotate(w);
    }
  }

  function spinwheelengine() {
    frame();
    requestAnimationFrame(spinwheelengine);
  }

  function playSound(w){
  	if(!isNum(w)){return;}
  	if(undefined != wheels[w].dataset.volume && wheels[w].dataset.volume==0){
  		return;
  	}
    // Stop and rewind the sound if it already happens to be playing.
    wheels[w].audio.pause();
    wheels[w].audio.currentTime = 0;
    // Play the sound.
    wheels[w].audio.play();
    wheels[w].volume=parseFloat(wheels[w].volume,3)+0.025;
    if(wheels[w].volume > 1){wheels[w].volume=1;}
    wheels[w].audio.v=wheels[w].dataset.volume||wheels[w].volume;
    wheels[w].audio.onplay=function(){
    	this.volume=this.v;
    }
  }
  // INIT
  spinwheelengine(); // Start engine
}
function decorateQuillAttachments(fname){
	//make ql-attachment links clickable
	let els=document.querySelectorAll('.ql-editor img[alt],.ql-editor img.ql-attachment');
	for(e=0;e<els.length;e++){
		let cfname=els[e].alt||fname||'attachment';
		if(els[e].processed==1){continue;}
		els[e].processed=1;
		if(els[e].src.indexOf('data:image') != -1){continue;}
		els[e].alt=cfname;
		els[e].style.textDecoration='underline';
		els[e].style.color='#487da6';
		els[e].style.cursor='pointer';
		els[e].className='ql-attachment';
		els[e].onclick=function(){
			let link=document.createElement('a');
			link.href=this.src;
			link.target='_blank';
			link.download=this.alt;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}
/* initPin - function to assign hover to dom objects that have data-behavior="pin" so they hide onMouseOut */
function initBehaviors(ajaxdiv){
	//info: initializes special data-behavior atrributes
	//assign hover to li and hide w_select select tags on hover
	//info: 	_behavior="clock" id="clockid"
	//usage:	<div data-behavior="menu" display="menuid">MouseOve</div><br><div id="menuid">This is the menu that is displayed</div>
	//	<div data-behavior="@math(one+(two*three))"></div>
	//	<div data-behavior="@sum(one:two:three)"></div>
	//	<div data-behavior="@raid(raidid)"></div><input type="text" name="raidid" value="123">
	//replace title attributes with ours
	try{initQuill();}catch(e){}
	try{initCarousels();}catch(e){}
	try{f_tcalInit();}catch(e){}
	try{initFlatpickr();}catch(e){}
	//init custom required messages
	try{initCustomValidity();}catch(e){}
	//initSpinWheel
	try{initSpinWheel();}catch(e){}
	//init drag sort
	try{dragSortEnable('[data-behavior="dragsort"]');}catch(e){}
	//check for data-navigate
	let navel = document.querySelector('[data-navigate]');
	if(undefined != navel){
		try{initNavigate();}catch(e){}
	}
	//check for data-displayif
	let displayif = document.querySelector('form [data-displayif]');
	if(undefined != displayif){
		try{initDisplayif();}catch(e){}
	}
	//check for EnlighterJS markup. data-enlighter-language
	navel = document.querySelector('[data-enlighter-language]');
	if(undefined != navel){
		try{initEnlighterJs();}catch(e){}
	}
	//bootstrap toggles
	var buttons=document.querySelectorAll('[data-toggle="buttons"] .btn');
	for(var i=0;i<buttons.length;i++){
		buttons[i].onclick=function(){
			//get all children of the parentNode
			var kids=this.parentNode.childNodes;
			for(var k=0;k<kids.length;k++){
            	removeClass(kids[k],'active');
			}
			addClass(this,'active');
		};
	}
	if(!window.jQuery){
		//look for data-toggle modal
		var navbars=document.querySelectorAll('[data-toggle="modal"]');
		for (var n=0; n<navbars.length; n++){
	    	navbars[n].onclick=function(e){
				cancel(e);
	        	var t=this.getAttribute('data-target');
	        	var tdiv=getObject(t);
	        	var state=tdiv.getAttribute('aria-hidden');
	        	switch(state.toLowerCase()){
	            	case 'f':
	            	case 'false':
	            	case 0:
	            		tdiv.setAttribute('aria-hidden','true');
	            		removeClass(tdiv,'in');
	            	break;
	            	default:
	            		tdiv.setAttribute('aria-hidden','false');
	            		addClass(tdiv,'in');
	            	break;
				}
				return false;
			};
		}
		//look for data-toggle modal
		navbars=document.querySelectorAll('[data-toggle="dropdown"]');
		for (n=0; n<navbars.length; n++){
	    	navbars[n].onclick=function(e){
				cancel(e);
	        	let p=getParent(this);
	        	if(undefined != p){
	            	if(p.className.indexOf('open')==-1){
	                	addClass(p,'open');
					}
					else{
						removeClass(p,'open');
					}
				}
				return false;
			};
		}
		//look for bootstrap navbars with a collapse toggle attribute and hook the onclick
		navbars=document.querySelectorAll('[data-toggle="collapse"]');
		for (n=0; n<navbars.length; n++){
	    	navbars[n].onclick=function(){
	        	var t=this.getAttribute('data-target');
	        	if(undefined == t){return false;}
	        	var tdiv=document.querySelector(t);
	        	if(undefined == tdiv){return false;}
	        	var state=this.getAttribute('aria-expanded');
	        	if(undefined == 'state'){state='';}
	        	if(state===null){state='';}
	        	switch(state.toLowerCase()){
	            	case 'f':
	            	case 'false':
	            	case '0':
	            	case '':
	            		this.setAttribute('aria-expanded','true');
	            		addClass(tdiv,'in');
	            	break;
	            	default:
	            		this.setAttribute('aria-expanded','false');
	            		removeClass(tdiv,'in');
	            	break;
				}
				return false;
			};
		}
	}
	else{
		//console.log('found jQuery');
	}
	//
	eventInitSticky();

	var navEls = GetElementsByAttribute('*', 'data-behavior', '.+');
	var navEls2 = GetElementsByAttribute('*', '_behavior', '.+');
	//backwords compatibility - get _behavior attributes also
	for (n=0; n<navEls2.length; n++){
		navEls2[n].setAttribute('data-behavior',navEls2[n].getAttribute('_behavior'));
		navEls2[n].removeAttribute('_behavior');
    	navEls[navEls.length]=navEls2[n];
	}
	//alert(navEls.length+' objects have behaviors');
	for (n=0; n<navEls.length; n++){
		var str=navEls[n].getAttribute('data-behavior').toLowerCase();
		var behaviors=str.split(/[\ \;]+/);
		if(in_array("ajax",behaviors)){
			/* AJAX - Updates div with ajax call every refresh seconds. data-behavior="ajax" url="" id="mytest" timer="20" */
  			var attr=getAllAttributes(navEls[n]);
  			if(undefined != attr['id'] && (undefined != attr['url'] || undefined != attr['data-url'] || undefined != attr['data-function']) && (undefined != attr['data-timer'] || undefined != attr['timer'])){
				ajaxTimer(attr['id']);
			}
		}
		if(in_array("animate",behaviors)){
			/* ANIMATE - get id and head */
            addEventHandler(navEls[n],'mouseover',function(e){
				animateGrow(this.id,parseInt(this.getAttribute('min'),10),parseInt(this.getAttribute('max'),10));
			});
			addEventHandler(navEls[n],'mouseout',function(e){
				if(undefined == e){e = fixE(e);}
				if(undefined != e){
					if(checkMouseLeave(this,e)){
						animateShrink(this.id,parseInt(this.getAttribute('max'),10),parseInt(this.getAttribute('min'),10));
					}
				}
			});
        }
        if(in_array("autogrow",behaviors)){
			/* AUTOGROW - textarea will auto based on content */
			navEls[n].setAttribute('data-autogrow',navEls[n].style.height);
            addEventHandler(navEls[n],'focus',function(e){
				autoGrow(this);
			});
			addEventHandler(navEls[n],'keypress',function(e){
				autoGrow(this);
			});
			addEventHandler(navEls[n],'blur',function(e){
				var h=this.getAttribute('data-autogrow');
				this.style.height=h;
			});
        }
        if(in_array("tabs",behaviors)){
			/* enable tabs */
			navEls[n].onkeydown = function(e){
		        if(e.keyCode==9 || e.which==9){
		            e.preventDefault();
		            var s = this.selectionStart;
		            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
		            this.selectionEnd = s+1; 
		        }
		    }
        }
        if(in_array("paypal_checkout",behaviors)){
			/* Paypal Checkout */
			if(undefined != navEls[n].id){
				let paypal_checkout={
					style: {
				        shape: navEls[n].dataset.shape  || 'pill',
				        color: navEls[n].dataset.color  || 'blue',
				        layout:navEls[n].dataset.layout || 'vertical',
				        label: navEls[n].dataset.label  || 'paypal' 
				    }
	            };
	            paypal_checkout.renderid=navEls[n].id;
	            paypal_checkout.cartinfo=JSON.parse(trim(getText(navEls[n])));
	            paypal_checkout.createOrder=function(data, actions) {
	                return actions.order.create(paypal_checkout.cartinfo);
	            };
	            paypal_checkout.debug=navEls[n].dataset.debug || 0;
	            if(undefined != navEls[n].dataset.onapprove){
	            	if(paypal_checkout.debug==1){
	            		console.log('paypal_checkout - onapprove set');
	            	}
	            	paypal_checkout.onapprove_func=navEls[n].dataset.onapprove;
	            	paypal_checkout.onApprove=function(data, actions) {
	                    return actions.order.capture().then(function(details) {
	                		let rtn={
	                			order_id:details.id,
	                			order_cdate:details.create_time,
	                			order_edate:details.update_time,
	                			order_status:details.status,
	                			order_amount:details.purchase_units[0].amount.value,
	                			order_reference_id:details.purchase_units[0].reference_id || '',
	                			order_custom_id:details.purchase_units[0].custom_id || '',
	                			payee_email:details.purchase_units[0].payee.email_address,
	                			payee_merchant_id:details.purchase_units[0].payee.merchant_id,
	                			payer_id:details.payer.payer_id,
	                			payer_email:details.payer.email_address,
	                			shipping_full_name:details.purchase_units[0].shipping.name.full_name,
	                			shipping_address_line_1:details.purchase_units[0].shipping.address.address_line_1,
	                			shipping_address_line_2:details.purchase_units[0].shipping.address.address_line_2,
	                			shipping_city:details.purchase_units[0].shipping.address.admin_area_2,
	                			shipping_state:details.purchase_units[0].shipping.address.admin_area_1,
	                			shipping_postal_code:details.purchase_units[0].shipping.address.postal_code,
	                			shipping_country_code:details.purchase_units[0].shipping.address.country_code,
	                			payer_country_code:details.payer.address.country_code,
	                			payer_firstname:details.payer.name.given_name,
	                			payer_lastname:details.payer.name.surname,
	                			payment_status:details.purchase_units[0].payments.captures[0].status,
	                			payment_id:details.purchase_units[0].payments.captures[0].id
	                		};
	                		if(paypal_checkout.debug==1){
	                			console.log('paypal_checkout - onApprove called');
	                			console.log(details);
	                		}
	                		parent.window[paypal_checkout.onapprove_func](rtn);
	                		//let jsfunc=new Function(paypal_checkout.onapprove_func);
    						//jsfunc(rtn);
	                    });
	            	};
	            }
	            if(undefined != navEls[n].dataset.oncancel){
	            	paypal_checkout.oncancel_func=navEls[n].dataset.oncancel;
	            	if(paypal_checkout.debug==1){
	            		console.log('paypal_checkout - onCancel set');
	            	}
	            	paypal_checkout.onCancel=function(data) {
	            		if(paypal_checkout.debug==1){
	            			console.log('paypal_checkout - onCancel called');
	            		}
    					parent.window[paypal_checkout.oncancel_func]();
	            	};
	            }
	            setText(navEls[n],'');
	            try{
					paypal.Buttons(paypal_checkout).render('#'+paypal_checkout.renderid);
				}
				catch(e){
					if(undefined != navEls[n].dataset.onfail){
						parent.window[navEls[n].dataset.onfail](e);
					}
					else{
						console.log('paypal_checkout - paypal.Buttons render failed');
						console.log(e);
					}
		        }
				
			}
		}
        if(in_array("chart",behaviors)){
			/* Chart using Chart.js */
			var chart_type=navEls[n].getAttribute('data-type') || 'bar';
			chart_type=chart_type.toLowerCase();
			//labels
			var chart_labels=navEls[n].getAttribute('data-labels') || '';
			chart_labels=chart_labels.split(',');
			//showProperties(chart_labels,'debug',1);return;
			//datasets
			var chart_datasets=new Array();
			var chart_id=navEls[n].getAttribute('data-datasets') || '';
			var chart_ids=GetElementsByAttribute('div', 'id', chart_id);
			//showProperties(chart_ids,'debug',1);
			for (i=0; i<chart_ids.length; i++) {
				var txt=getText(chart_ids[i]);
				var dataset=parseJSONString(txt);
				chart_datasets.push(dataset);
			}
			//showProperties(chart_datasets,'debug',1);
			var chart_data={
				labels:chart_labels,
				datasets:chart_datasets
			};
			var chart_options=navEls[n].getAttribute('data-options') || '';
			if(undefined != document.getElementById(chart_options)){
            	chart_options=getText(chart_options);
			}
			chart_options=parseJSONString(chart_options);
			var myLine;
			switch(chart_type){
				case 'bar':
					myLine = new Chart(navEls[n].getContext("2d")).Bar(chart_data,chart_options);
				break;
				case 'line':
					myLine = new Chart(navEls[n].getContext("2d")).Line(chart_data,chart_options);
				break;
				case 'pie':
					myLine = new Chart(navEls[n].getContext("2d")).Pie(chart_data,chart_options);
				break;
				default:
					myLine='';
				break;
			}
			//save as an image if requested
			var chart_image=navEls[n].getAttribute('data-image') || '';
			if(chart_image.length){
				var img=navEls[n].toDataURL();
            	setText(chart_image,img);
			}
		}
        if(in_array("clock",behaviors)){
			/*CLOCK - */
  			var id=navEls[n].getAttribute('id');
			if(id){startClock(id,1);}
		}
		if(in_array("clone",behaviors)){
			/*CLONE DIV - */
			cloneDiv(navEls[n]);
		}
		if(in_array("utcclock",behaviors)){
			/*UTC CLOCK - */
  			var id=navEls[n].getAttribute('id');
			if(id){startUTCClock(id,1);}
		}
		else if(in_array("countdown",behaviors)){
			/* COUNTDOWN */
  			var id=navEls[n].getAttribute('id');
			if(id){countDown(id);}
		}
		else if(in_array("countdowntime",behaviors)){
			/* COUNTDOWN */
  			var id=navEls[n].getAttribute('id');
			if(id){countdownTime(id);}
		}
		else if(in_array("countdowndate",behaviors)){
			/* COUNTDOWNDATE */
  			let id=navEls[n].getAttribute('id');
			if(id){
				let year=navEls[n].dataset.year || navEls[n].getAttribute('year');
				let month=navEls[n].dataset.month || navEls[n].getAttribute('month');
				let day=navEls[n].dataset.day || navEls[n].getAttribute('day');
				let hour=navEls[n].dataset.hour || navEls[n].getAttribute('hour');
				let minute=navEls[n].dataset.minute || navEls[n].getAttribute('minute');
				let tz=navEls[n].dataset.tz || navEls[n].getAttribute('tz');
				countDownDate(id,year,month,day,hour,minute,tz);
			}
		}
		if(in_array("drag",behaviors)){
			/* DRAG - Make object draggable */
			let head=navEls[n].dataset.head || navEls[n].getAttribute('head');
			let headobj=getObject(head);
			navEls[n].style.position='relative';
            if(undefined == headobj){
				//alert('drag behavior error. no head defined: '+navEls[n].getAttribute('id'));
				Drag.init(navEls[n]);
			}
			else{
            	Drag.init(headobj,navEls[n]);
   			}
        }
        if(in_array("email-link",behaviors)){
			/* email link:  /info/wasql/com/  */
			navEls[n].setAttribute('data-behavior','processed');
			if(undefined != navEls[n].dataset.href){
				let email=navEls[n].dataset.href;
				email=email.replace(/^[\/]+/,'',email);
				email=email.replace(/[\/]+$/,'',email);
				email=email.replace(/[\/]/,'@',email);
				email=email.replace(/[\/]/,'.',email);
				navEls[n].href='mailto:'+email;
			}
			else{
				let email=navEls[n].dataset.value || navEls[n].innerText;
				email=email.replace(/^[\/]+/,'',email);
				email=email.replace(/[\/]+$/,'',email);
				email=email.replace(/[\/]/,'@',email);
				email=email.replace(/[\/]/,'.',email);
				navEls[n].href='mailto:'+email;
				navEls[n].innerText=email;
			}
		}
		if(in_array("loadtextfile",behaviors)){
			loadTextFileInit(navEls[n]);
		}
		if(in_array("markers",behaviors)){
			wasqlMarkerInit(navEls[n]);
		}
        	if(in_array("signature",behaviors)){
			/* Signature */
			let pencolor=navEls[n].getAttribute('data-color') || '#000';
			signaturePad = new SignaturePad(navEls[n],{penColor:pencolor});
			signaturePad.saveSignature();
		}
		if(in_array("tab_enable",behaviors)){
			/* Enable tabs - */
			navEls[n].onkeydown = function(e){
				if(e.keyCode==9 || e.which==9){
					e.preventDefault();
					var s = this.selectionStart;
					this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
					this.selectionEnd = s+1; 
				}
			}
		}
		if(in_array("zoom",behaviors)){
			/*zoom - optional attributes:  data-zoomsrc, id, data-zoomalwaysshow */
			if(undefined == navEls[n].getAttribute('id')){
				navEls[n].setAttribute('id',guid());
			}
			if(undefined == navEls[n].getAttribute('data-zoomsrc')){
				/*set the zoom image to the src image */
				navEls[n].setAttribute('data-zoomsrc',navEls[n].src);
			}
    		MojoZoom.makeZoomable(navEls[n], navEls[n].getAttribute('data-zoomsrc'), document.getElementById(navEls[n].getAttribute("id") + "_zoom"), null, null, navEls[n].getAttribute("data-zoomalwaysshow")=="true");
		}
        if(in_array("fileupload",behaviors)){
			/*FILEUPLOAD - HTMl5 only - drag files here to upload */
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				//save original background color
				navEls[n].setAttribute('_bgcolor',navEls[n].style.backgroundColor || '');
  				//add event listeners
  				addEventHandler(navEls[n],"dragover",function(evt){
					cancelBubble(evt);
					}
				);
				addEventHandler(navEls[n],"dragexit", function(evt){
					cancelBubble(evt);
						var bgcolor='';
						if(undefined != this.getAttribute('_dragcolor_out')){bgcolor=this.getAttribute('_dragcolor_out');}
						this.style.backgroundColor=bgcolor;
					}
				);
				addEventHandler(navEls[n],"dragenter", function(evt){
					cancelBubble(evt);
					//change background of div when files are dragged over it to signify it accepts files
					this.style.backgroundColor=this.getAttribute('data-color-over') || 'green';
					}, false);
				addEventHandler(navEls[n],"drop", function(evt){
					// get window.event if e argument missing (in IE)
					evt = evt || window.event;
					// stops the browser from redirecting off to the image.
		            cancelBubble(evt);
					this.style.backgroundColor=this.getAttribute('_bgcolor');
					fileUploadBehavior(evt,this);
					},false);
			}
			else{
				setText(navEls[n],'Fileupload via dragdrop is not supported in your browser.');
            }
        }
        if(in_array("float",behaviors)){
			/* FLOAT */
			var id=navEls[n].getAttribute('id');
			if(id){
				let top=navEls[n].dataset.top || navEls[n].getAttribute('top');
				floatDiv(id, top);
            }
		}
		if(in_array("marquee",behaviors)){
			/* MARQUEE - turns text into a scrolling marquee. data-behavior="marquee" timer="2" */
  			var attr=getAllAttributes(navEls[n]);
  			if(undefined != attr['id']){
               	marquee(attr['id']);
			}
		}
		if(in_array("pin",behaviors)){
			/*PIN - */
			addEventHandler(navEls[n],'mouseout',function(e){
				if(undefined == e){e = fixE(e);}
				if(undefined != e){
					if(checkMouseLeave(this,e)){
						this.style.display='none';
						var onhide=this.getAttribute('onhide');
						if(onhide){
							let jsfunc=new Function(onhide);
    						jsfunc();
						}
					}
				}
			});
        }
		else if(in_array("dropdown",behaviors)){
			/* Dropdown MENU - */
			var dname=navEls[n].dataset.display || navEls[n].getAttribute('display');
			if(dname){
				navEls[n].style.position='relative';
				addEventHandler(navEls[n],'click',function(e){
					let dname=navEls[n].dataset.display || navEls[n].getAttribute('display');
					dObj=getObject(dname);
					if(dObj){
						if(dObj.style.display == 'block'){return true;}
						dObj.style.display='block';
						dObj.style.position='absolute';
				    	dObj.style.bottom="-199px";
				    	dObj.style.height="200px";
				    	dObj.style.left="0px";
				    	dObj.style.zIndex='999999';
				    	dObj.style.backgroundColor='#FFF';
					}
                });
                addEventHandler(navEls[n],'mouseout',function(e){
					if(undefined == e){e = fixE(e);}
					if(undefined != e){
						if(checkMouseLeave(this,e)){
							let dname=navEls[n].dataset.display || navEls[n].getAttribute('display');
							dObj=getObject(dname);
							if(dObj){
								var hide=0;
								if(undefined != dObj.className){
									if(dObj.className.indexOf("current") == -1){hide++;}
                                }
								else{
									var cclass=dObj.getAttribute('class');
									if(undefined == cclass){hide++;}
									else{
										if(cclass.indexOf("current") == -1){hide++;}
	                                }
								}
                                if(hide){dObj.style.display='none';}
							}
							var onhide=this.getAttribute('onhide');
							if(onhide){
								let jsfunc=new Function(onhide);
    							jsfunc();
    						}
						}
					}
				});
            }
		}
		else if(in_array("menu",behaviors)){
			/* MENU - */
  			var dname=navEls[n].dataset.display || navEls[n].getAttribute('display');
			if(dname){
				addEventHandler(navEls[n],'click',function(e){
					var dname=this.dataset.display || this.getAttribute('display');
					dObj=getObject(dname);
					if(undefined != dObj){
						//check for custom dislay
						if(undefined != dObj.dataset.display){
							if(dObj.style.display == dObj.dataset.display){return true;}
							dObj.style.display=dObj.dataset.display;
						}
						else{
							if(dObj.style.display == 'block'){return true;}
							dObj.style.display='block';
						}
					}
					var dmouse=this.getAttribute('mouse');
					var dx=this.getAttribute('x');
					var dy=this.getAttribute('y');
					if(undefined != dmouse){
						//position
						var x=0;
						var y=0;
						if(dmouse.indexOf('x') != -1){
							//only center x - make y MouseY
							x=MouseX;
				        }
				        else if(dmouse.indexOf('y') != -1){
							//only center y - make x MouseX
							y=MouseY;
				        }
				        else{
                            x=MouseX;
                            y=MouseY;
                        }
						//check for x and y
						if(undefined != dx){
							//if x begins with a + or -, then add it
							xvalue=dx+'';
							if(xvalue.indexOf('+') != -1){x=Math.round(MouseX+parseInt(xvalue));}
							else if(xvalue.indexOf('-') != -1){x=Math.round(MouseX-Math.abs(parseInt(xvalue)));}
							else{x=Math.round(Math.abs(parseInt(xvalue)));}
						}
						if(undefined != dy){
							//if y begins with a + or -, then add it
							yvalue=dy+'';
							if(yvalue.indexOf('+') != -1){y=Math.round(MouseY+parseInt(yvalue));}
							else if(yvalue.indexOf('-') != -1){y=Math.round(MouseY-Math.abs(parseInt(yvalue)));}
							else{y=Math.round(Math.abs(parseInt(yvalue)));}
						}
                        dObj.style.position='absolute';
				    	dObj.style.top=y+"px";
				    	dObj.style.left=x+"px";
				    	//window.status="Set menu postion to "+x+','+y;
                    }
                });
                addEventHandler(navEls[n],'mouseover',function(e){
					var dname=this.dataset.display || this.getAttribute('display');
					dObj=getObject(dname);
					if(undefined != dObj){
						//check for custom dislay
						if(undefined != dObj.dataset.display){
							if(dObj.style.display == dObj.dataset.display){return true;}
							dObj.style.display=dObj.dataset.display;
						}
						else{
							if(dObj.style.display == 'block'){return true;}
							dObj.style.display='block';
						}
					}
					var dmouse=this.getAttribute('mouse');
					var dx=this.getAttribute('x');
					var dy=this.getAttribute('y');
					if(undefined != dmouse){
						//position
						var x=0;
						var y=0;
						if(dmouse.indexOf('x') != -1){
							//only center x - make y MouseY
							x=MouseX;
				        }
				        else if(dmouse.indexOf('y') != -1){
							//only center y - make x MouseX
							y=MouseY;
				        }
				        else{
                            x=MouseX;
                            y=MouseY;
                        }
						//check for x and y
						if(undefined != dx){
							//if x begins with a + or -, then add it
							xvalue=dx+'';
							if(xvalue.indexOf('+') != -1){x=Math.round(MouseX+parseInt(xvalue));}
							else if(xvalue.indexOf('-') != -1){x=Math.round(MouseX-Math.abs(parseInt(xvalue)));}
							else{x=Math.round(Math.abs(parseInt(xvalue)));}
						}
						if(undefined != dy){
							//if y begins with a + or -, then add it
							yvalue=dy+'';
							if(yvalue.indexOf('+') != -1){y=Math.round(MouseY+parseInt(yvalue));}
							else if(yvalue.indexOf('-') != -1){y=Math.round(MouseY-Math.abs(parseInt(yvalue)));}
							else{y=Math.round(Math.abs(parseInt(yvalue)));}
						}
                        dObj.style.position='absolute';
				    	dObj.style.top=y+"px";
				    	dObj.style.left=x+"px";
				    	//window.status="Set menu postion to "+x+','+y;
                    }
                });
                addEventHandler(navEls[n],'mouseout',function(e){
					if(undefined == e){e = fixE(e);}
					if(undefined != e){
						if(checkMouseLeave(this,e)){
							var dname=this.dataset.display || this.getAttribute('display');
							dObj=getObject(dname);
							if(dObj){
								var hide=0;
								if(undefined != dObj.className){
									if(dObj.className.indexOf("current") == -1){hide++;}
                                }
								else{
									var cclass=dObj.getAttribute('class');
									if(undefined == cclass){hide++;}
									else{
										if(cclass.indexOf("current") == -1){hide++;}
	                                }
								}
                                if(hide){dObj.style.display='none';}
							}
							var onhide=this.getAttribute('onhide');
							if(onhide){
								let jsfunc=new Function(onhide);
    							jsfunc();
    						}
						}
					}
				});
            }
		}
		if(in_array("scrolltable",behaviors)){
			/* SCROLLTABLE  */
			var id=navEls[n].getAttribute('id');
			var h=navEls[n].dataset.scrollheight || navEls[n].getAttribute('scrollheight');
  			var w=navEls[n].dataset.scrollwidth || navEls[n].getAttribute('scrollwidth');
			if(id){scrollableTable(navEls[n],h,w);}
		}
		if(in_array("slideshow",behaviors)){
			/* SLIDESHOW */
			var id=navEls[n].getAttribute('id');
			if(id){
				addClass(navEls[n],'w_slideshow');
				var t=navEls[n].dataset.timer || navEls[n].getAttribute('timer') || 15;
				//add navigation
				var navobj=getObject(id+'_nav');
				if(undefined != navobj){
					var tag=navEls[n].dataset.tag || navEls[n].getAttribute('tag') || 'img';
					var objs=navEls[n].getElementsByTagName(tag);
					if(objs.length!=0){
                    	var txt='';
                    	for(var n=0;n<objs.length;n++){
							var navtitle=objs[n].getAttribute('title') || '';
							if(t){
                        		txt+='<div id="'+id+'_nav_'+n+'" data-tooltip="'+navtitle+'" data-tooltip_position="bottom" class="" onclick="slideShow(\''+id+'\','+n+','+t+');"></div>';
							}
							else{
								txt+='<div id="'+id+'_nav_'+n+'" data-tooltip="'+navtitle+'" data-tooltip_position="bottom" class=""  onclick="slideShow(\''+id+'\','+n+');"></div>';
							}
						}
						setText(navobj,txt);
					}
				}
				slideShow(id,0,t);
			}
		}
		if(in_array("sticky",behaviors)){
			/* STICKY - makes menu sticky even when scrolling past it. data-behavior="sticky" */
  			var pos=getPos(navEls[n]);
  			var wh=getWidthHeight(navEls[n]);
  			navEls[n].setAttribute('sticky_y',pos.y+wh[1]);
			navEls[n].setAttribute('sticky_x',pos.x+wh[0]);
			if(undefined != navEls[n].style.zIndex){
				navEls[n].setAttribute('sticky_z',navEls[n].style.zIndex);
			}
			if(calledStickyMenus==0){
				addEventHandler(window,'scroll',stickyMenus);
				calledStickyMenus=1;
			}
		}
		if(in_array("stopwatch",behaviors)){
			/* STOPWATCH */
  			var id=navEls[n].getAttribute('id');
			if(id){stopWatch(id,0);}
		}
		else if(in_array("timer_verbose",behaviors)){
			/* Timer Verbose */
  			var id=navEls[n].getAttribute('id');
			if(undefined != id){
				var t=parseInt(getText(navEls[n]),10);
				if(!isNaN(t)){
					navEls[n].setAttribute('timer_verbose',t);
					timerVerbose(id,1);
				}	
			}
		}
		else if(in_array("time_verbose",behaviors)){
			/* Time Verbose */
			var s=getText(navEls[n]);
			if(!isNaN(s)){
				var secs=parseInt(s,10);
				if(!isNaN(secs)){
					var t=verboseTime(secs);
					if(t.length){
						setText(navEls[n],t);
					}
				}
			}
		}
		else if(in_array("time",behaviors)){
			/* TIME */
  			var id=navEls[n].getAttribute('id');
			if(id){startClock(id,0);}
		}
		if(in_array("tab",behaviors)){
			/* Enable tab in box */
			addEventHandler(navEls[n],'keydown',function(e){
		        if(e.keyCode==9 || e.which==9){
		            e.preventDefault();
		            var s = this.selectionStart;
		            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
		            this.selectionEnd = s+1;
		        }
		    });
		}
		/*	Check for @math(..)  @sum(..)
			@sum(one:two:three)
			@avg(one:two:three)
			@math(one+two+three)
			str.replace(/microsoft/, "W3Schools")
		*/
		for(b in behaviors){
			var behavior=behaviors[b];
			//alert(behavior);
			var id=navEls[n].getAttribute('id');
			var re = new RegExp('\@([a-z]+)[(](.+)[)]', 'igm');
        	var res = re.exec(behavior);
	        if (res && res.length > 0){
				var func=res[1].toLowerCase();
				var str=res[2].toLowerCase();
				switch (func){
					case 'sum':
						var result=0;
						var sids=str.split(/[,:\s]+/);
						var dec=navEls[n].dataset.decimal||0;
						for (let s=0; s<sids.length; s++) {
							let sidobj=document.querySelector('#'+sids[s]);
							if(undefined == sidobj){continue;}
							if(undefined == sidobj.handler_set){
								sidobj.handler_set=1;
								addEventHandler(sidobj,'keyup',function(){
									initBehaviors();
								});
							}
							result += Math.round(getText(sids[s]),dec);
	                    }
	                    result=Math.round(result,dec);
	                    setText(navEls[n],result);
					break;
					case 'avg':
						var tot=0;
						var cnt=0;
						var sids=str.split(/[,:\s]+/);
						for (let s=0; s<sids.length; s++) {
							let sidobj=document.querySelector('#'+sids[s]);
							if(undefined == sidobj){continue;}
							if(undefined == sidobj.handler_set){
								sidobj.handler_set=1;
								addEventHandler(sidobj,'keyup',function(){
									initBehaviors();
								});
							}
							tot += Math.round(getText(sids[s]));
							cnt += 1;
	                    }
	                    var dec=navEls[n].dataset.decimal||0;
	                    var result=Math.round((tot/cnt),dec);
	                    //console.log('tot:'+tot+', cnt:'+cnt+', dec:'+dec+', result:'+result);
	                    setText(navEls[n],result);
					break;
					case 'max':
						var max=0;
						var sids=str.split(/[,:\s]+/);
						for (let s=0; s<sids.length; s++) {
							let sidobj=document.querySelector('#'+sids[s]);
							if(undefined == sidobj){continue;}
							if(undefined == sidobj.handler_set){
								sidobj.handler_set=1;
								addEventHandler(sidobj,'keyup',function(){
									initBehaviors();
								});
							}
							let sval=getText(sids[s]);
							let svalp=parseFloat(sval);
							if(svalp > max){max=sval;}
	                    }
	                    var dec=navEls[n].dataset.decimal||0;
	                    var result=Math.round(max,dec);
	                    setText(navEls[n],result);
					break;
					case 'min':
						var min=9999999999999;
						var sids=str.split(/[,:\s]+/);
						for (let s=0; s<sids.length; s++) {
							let sidobj=document.querySelector('#'+sids[s]);
							if(undefined == sidobj){continue;}
							if(undefined == sidobj.handler_set){
								sidobj.handler_set=1;
								addEventHandler(sidobj,'keyup',function(){
									initBehaviors();
								});
							}
							let sval=getText(sids[s]);
							let svalp=parseFloat(sval);
							if(svalp < min){min=sval;}
	                    }
	                    var dec=navEls[n].dataset.decimal||0;
	                    var result=Math.round(min,dec);
	                    setText(navEls[n],result);
					break;
					case 'math':
						doMath(id);
					break;
					case 'raid':
						var cObj=getObject(str);
						if(typeof(cObj)=='object'){
							setText(cObj,getText(navEls[n]));
							navEls[n].setAttribute('raidid',str);
							addEventHandler(navEls[n],'keyup',function(){
								var raidid = this.getAttribute('raidid');
								setText(raidid,getText(this));
							});
							addEventHandler(navEls[n],'change',function(){
								var raidid = this.getAttribute('raidid');
								setText(raidid,getText(this));
							});
							addEventHandler(navEls[n],'blur',function(){
								var raidid = this.getAttribute('raidid');
								setText(raidid,getText(this));
							});
      					}
						break;
					}
	        	}
			}
       }
    //data tooltips
	var tobs=GetElementsByAttribute('*', 'data-tooltip','.+');
	for(var i=0;i<tobs.length;i++){
		addEventHandler(tobs[i],'mouseover', function(event){
			tooltipDiv(this);
			event.stopPropagation();
    		event.preventDefault();
		});
		addEventHandler(tobs[i],'focus', function(event){
			tooltipDiv(this);
			event.stopPropagation();
    		event.preventDefault();
		});
		addEventHandler(tobs[i],'mouseout', function(event){
			tooltipDivObj='';
			fadeId('w_tooltip',1,1);
			event.stopPropagation();
    		event.preventDefault();
		});
	}
	var tobs=GetElementsByAttribute('*', 'data-tip','.+');
	for(var i=0;i<tobs.length;i++){
		addEventHandler(tobs[i],'mouseover', function(event){
			tooltipDiv(this);
			event.stopPropagation();
    		event.preventDefault();
		});
		addEventHandler(tobs[i],'focus', function(event){
			tooltipDiv(this);
			event.stopPropagation();
    		event.preventDefault();
		});
		addEventHandler(tobs[i],'mouseout', function(event){
			tooltipDivObj='';
			fadeId('w_tooltip',1,1);
			event.stopPropagation();
    		event.preventDefault();
		});
	}
}
/**
* @describe initializes EnlighterJS elements
* @return false
* @usage initEnlighterJs();
* @reference 
*		https://enlighterjs.org/Documentation.html
*/
function initEnlighterJs(){
	let els=document.querySelectorAll('[data-enlighter-language]');
	for(let i=0;i<els.length;i++){
		if(undefined == els[i].dataset.enlightened){
			let params={language:els[i].dataset.enlighterLanguage,rawButton:false,infoButton:false,windowButton:false};
			if(undefined != els[i].dataset.enlighterRawbutton && els[i].dataset.enlighterRawbutton.indexOf('false')==-1){
				params.rawButton=true;
			}
			if(undefined != els[i].dataset.enlighterWindowbutton && els[i].dataset.enlighterWindowbutton.indexOf('false')==-1){
				params.windowButton=true;
			}
			if(undefined != els[i].dataset.enlighterInfobutton && els[i].dataset.enlighterInfobutton.indexOf('false')==-1){
				params.infoButton=true;
			}
			if(undefined != els[i].dataset.enlighterTheme){
				params.theme=els[i].dataset.enlighterTheme;
			}
			if(undefined != els[i].dataset.enlighterIndent){
				params.indent=els[i].dataset.enlighterIndent;
			}
			if(undefined != els[i].dataset.enlighterHighlight){
				params.highlight=els[i].dataset.enlighterHighlight;
			}
			EnlighterJS.enlight(els[i],params);
			els[i].dataset.enlightened=1;
		}
	}
	return false;
}
/**
* @describe initializes EnlighterJS elements
* @return false
* @usage initEnlighterJs();
* @reference 
*		https://enlighterjs.org/Documentation.html
*/
function initFlatpickr(){
	let els=document.querySelectorAll('input[data-behavior="flatpickr"]');
	if(!els.length){return false;}
	// if(els.length){
	// 	flatpickr.init.prototype.defaultConfig.prevArrow = "<span class='icon-arrow-left'></span>";
 //          flatpickr.init.prototype.defaultConfig.nextArrow = "<span class='icon-arrow-right'></span>";
	// }
	let nlang=navigator.language || 'en-US';
	nlang=nlang.split('-')[0];
	for(let i=0;i<els.length;i++){
		if(undefined != els[i].dataset.initflatpickr){continue;}
		els[i].dataset.initflatpickr=1;
		let lang=els[i].dataset.lang || nlang;
		let config={
			errorHandler: function (err) {
				alert(err);
	          	return false;
	        	}
		};
		config.prevArrow = "<span class='icon-arrow-left'></span>";
		config.nextArrow = "<span class='icon-arrow-right'></span>";
		for(k in els[i].dataset){
			let v=els[i].dataset[k];
			switch(k.toLowerCase()){
				case 'altformat':k='altFormat';break;
				case 'altinput':k='altInput';break;
				case 'altinputclass':k='altInputClass';break;
				case 'allowinput':k='allowInput';break;
				case 'allowinvalidpreload':k='allowInvalidPreload';break;
				case 'appendto':
					k='appendTo';
					v=document.querySelector(v)||getObject(v);
				break;
				case 'ariadateformat':k='ariaDateFormat';break;
				case 'conjunction':k='conjunction';break;
				case 'clickopens':k='clickOpens';break;
				case 'dateformat':k='dateFormat';break;
				case 'defaultdate':
					if(undefined != els[i].value && els[i].value.length){k='';}
					else{k='defaultDate';}
				break;
				case 'defaulthour':k='defaultHour';break;
				case 'defaultminute':k='defaultMinute';break;
				case 'disablemobile':k='disableMobile';break;
				case 'enabletime':k='enableTime';break;
				case 'enableseconds':k='enableSeconds';break;
				case 'firstdayofweek':
				case 'firstday':
					if(undefined == config.locale){
						config.locale={};
					}
					config.locale.firstDayOfWeek=v;
					continue;
					//k='firstDayOfWeek';
				break;
				case 'hourincrement':k='hourIncrement';break;
				case 'maxdate':
					k='maxDate';
					if(!isNaN(v)){
						if(v < 0){
							v=Math.abs(v);
							v = new Date(new Date().setDate(new Date().getDate() - v)).toLocaleDateString('en-CA');	
						}
						else if(v > 0){
							v=Math.abs(v);
							v = new Date(new Date().setDate(new Date().getDate() + v)).toLocaleDateString('en-CA');	
						}	
					}
					else if(v.toLowerCase()=='today'){
						v=new Date().toLocaleDateString('en-CA');
					}
					els[i].dataset.maxdate_value=v;
				break;
				case 'mindate':
					k='minDate';
					if(!isNaN(v)){
						if(v < 0){
							v=Math.abs(v);
							v = new Date(new Date().setDate(new Date().getDate() - v)).toLocaleDateString('en-CA');	
						}
						else if(v > 0){
							v=Math.abs(v);
							v = new Date(new Date().setDate(new Date().getDate() + v)).toLocaleDateString('en-CA');	
						}	
					}
					else if(v.toLowerCase()=='today'){
						v=new Date().toLocaleDateString('en-CA');
					}
					els[i].dataset.mindate_value=v;
				break;
				case 'minuteincrement':k='minuteIncrement';break;
				case 'nextarrow':k='nextArrow';break;
				case 'nocalendar':k='noCalendar';break;
				case 'prevarrow':k='prevArrow';break;
				case 'shorthandcurrentmonth':k='shorthandCurrentMonth';break;
				case 'showmonths':k='showMonths';break;
				case 'weeknumbers':
				case 'showweeknumber':
					k='weekNumbers';
				break;
				case 'monthselectortype':k='monthSelectorType';break;
				default:continue;break;
			}
			switch(v.toLowerCase()){
				case 'true':
				case '1':
					v=true;
				break;
				case 'false':
				case '0':
					v=false;
				break;
			}
			if(k != ''){config[k]=v;}
		}
		switch(lang.toLowerCase()){
			case 'es':
				//spanish
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
				config.locale.months.shorthand = ['enero', 'feb.', 'marzo', 'abr.', 'mayo', 'jun.', 'jul.', 'agosto', 'sept.', 'oct.', 'nov.', 'dic.'];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
				config.locale.weekdays.shorthand = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
				config.locale.firstDayOfWeek = 1;
				config.locale.rangeSeparator=" a ";
				config.locale.time_24hr=true;
				config.locale.ordinal=function(){return "º";};
			break;
			case 'de':
				//german
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
				config.locale.months.shorthand = ['Jan.', 'Feb.', 'Marz', 'Apr.', 'Mai', 'Juni.', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
				config.locale.weekdays.shorthand = ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'];
				//in Germany the first day of the week is Monday
				config.locale.firstDayOfWeek = 1;
				config.locale.weekAbbreviation = "KW";
      			config.locale.rangeSeparator = " bis ";
      			config.locale.scrollTitle = "Zum Ändern scrollen";
      			config.locale.toggleTitle = "Zum Umschalten klicken";
      			config.locale.time_24hr = true;
			break;
			case 'fr':
				//french
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
				config.locale.months.shorthand = ['janv.', 'févr.', 'mars', 'avril.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
				config.locale.weekdays.shorthand = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
				config.locale.ordinal = function (nth) {
			          if (nth > 1){return "";}
			          return "er";
			     };
			     rangeSeparator = " au ";
			     weekAbbreviation = "Sem";
			     scrollTitle = "Défiler pour augmenter la valeur";
			     toggleTitle = "Cliquer pour basculer";
			     time_24hr = true;
			break;
			case 'it':
				//italian
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
				config.locale.months.shorthand = ['genn.', 'febbr.', 'mar.', 'abr.', 'magg.', 'giugno', 'luglio', 'ag.', 'sett.', 'ott.', 'nov.', 'dic.'];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
				config.locale.weekdays.shorthand = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
				//in Italy the first day of the week is Monday
				config.locale.firstDayOfWeek = 1;
				config.locale.ordinal = function () { return "°"; };
      			config.locale.rangeSeparator = " al ";
      			config.locale.weekAbbreviation = "Se";
      			config.locale.scrollTitle = "Scrolla per aumentare";
      			config.locale.toggleTitle = "Clicca per cambiare";
      			config.locale.time_24hr = true;
			break;
			case 'ja':
				//japanese
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
				config.locale.months.shorthand = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
				config.locale.weekdays.shorthand = ["日", "月", "火", "水", "木", "金", "土"];
				config.locale.time_24hr=true;
				config.locale.rangeSeparator = " から ";
			     config.locale.monthAriaLabel = "月";
			     config.locale.amPM = ["午前", "午後"];
			     config.locale.yearAriaLabel = "年";
			     config.locale.hourAriaLabel = "時間";
			     config.locale.minuteAriaLabel = "分";
			break;
			case 'ko':
				//korean
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
				config.locale.months.shorthand = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
				config.locale.weekdays.shorthand = ["일", "월", "화", "수", "목", "금", "토"];
				config.locale.rangeSeparator = " ~ ";
			     config.locale.ordinal = function(){return "일";};
			break;
			case 'pt':
				//portuguese
				config.locale={};
				config.locale.months={};
				config.locale.months.longhand = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
				config.locale.months.shorthand = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
				config.locale.weekdays = {};
				config.locale.weekdays.longhand = [ "Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
				config.locale.weekdays.shorthand = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
				config.locale.rangeSeparator = " até ";
			     config.locale.time_24hr = true;
			break;
			case 'zh':
				//chinese
				config.locale={};
				config.locale.months = {};
				config.locale.months.longhand = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
				config.locale.months.shorthand = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
				config.locale.weekdays={};
				config.locale.weekdays.longhand = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
				config.locale.weekdays.shorthand = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
				config.locale.rangeSeparator = " 至 ";
      			config.locale.weekAbbreviation = "周";
      			config.locale.scrollTitle = "滚动切换";
      			config.locale.toggleTitle = "点击切换 12/24 小时时制";
			break;
		}
		//console.log(config);
		flatpickr(els[i],config);
	}
	return false;
}
/**
* @describe initializes elements with a data-navigate tag so you can use the arrow keys to navigate through them
*	There are two modes: tree and menu. Default is tree
*	data-navigate-group="mygroup" - sets the navigate group to stay in
*	data-navigate-right="myfunction"  - overides normal mode and calls your function passing it the current element
*	data-navigate-left="myfunction"  - overides normal mode and calls your function passing it the current element
*	data-navigate-up="myfunction"  - overides normal mode and calls your function passing it the current element
*	data-navigate-down="myfunction"  - overides normal mode and calls your function passing it the current element
*	data-navigate-all="myfunction"  - overides all normal modes and calls your function passing it the current element
*	data-navigate-focus="myfunction" - calls this function on focus, defaults to the onclick event
*	NOTE: all navigation elements must have a data-navigate attribute.
* @return false
* @usage initNavigate();
* @reference 
*		https://keycode.info/
*		https://gomakethings.com/how-to-get-the-next-and-previous-siblings-of-an-element-with-vanilla-js/

*/
function initNavigate(){
	let navigate_check=document.querySelector('[data-navigate]');
	if(undefined == navigate_check){
		console.log('initNavigate - check failed');
		return;
	}
	//mark any data-navigate-focus
	let fels = [...document.querySelectorAll('[data-navigate-focus^="Ctrl+" i]')];
	//console.log('initNavigate - ctrl focus count = '+fels.length);
	for(let i=0;i<fels.length;i++){
		//set title
		fels[i].title='Access Key = '+fels[i].dataset.navigateFocus;
		//check for data-navigate-text span
		let span=fels[i].querySelector('.navigate-text');
		if(undefined == span){continue;}
		let letter = fels[i].dataset.navigateFocus.replace('Ctrl+','');
		if(letter.length==1){
			let str=span.innerText;
			if(undefined != span.dataset.navigateColor){
				span.innerHTML=str.replace(letter,'<span style="border-bottom:1px solid '+span.dataset.navigateColor+';">'+letter+'</span>');
			}
			else{
				span.innerHTML=str.replace(letter,'<span style="border-bottom:1px solid #d70000;">'+letter+'</span>');
			}
		}
	}
	fels = [...document.querySelectorAll('[data-navigate-focus^="Alt+" i]')];
	//console.log('initNavigate - alt focus count = '+fels.length);
	for(let i=0;i<fels.length;i++){
		fels[i].title='Access Key = '+fels[i].dataset.navigateFocus;
		//check for data-navigate-text span
		let span=fels[i].querySelector('.navigate-text');
		if(undefined == span){continue;}
		let letter = fels[i].dataset.navigateFocus.replace('Alt+','');
		if(letter.length==1){
			let str=span.innerText;
			if(undefined != span.dataset.navigateColor){
				span.innerHTML=str.replace(letter,'<span style="border-bottom: 1px solid '+span.dataset.navigateColor+';">'+letter+'</span>');
			}
			else{
				span.innerHTML=str.replace(letter,'<span style="border-bottom:1px solid #0000e8;">'+letter+'</span>');
			}
		}
	}
	let navels = [...document.querySelectorAll('[data-navigate]')];
	//console.log('initNavigate - navigate count = '+navels.length);
	let groupcounts=new Array();
	for(let i=0;i<navels.length;i++){
		//add a tabindex to make it focusable since only a, select, input, button, textarea types are usually focusable
		if(undefined == navels[i].tabindex){
			navels[i].setAttribute('tabindex',i+1);
		}
		//give this a unique index
		navels[i].setAttribute('data-navigate',i);
		//add a group if one is not defined
		let group='navigate';
		if(undefined == navels[i].dataset.navigateGroup){
			navels[i].setAttribute('data-navigate-group',group);
		}
		else{
			group=navels[i].dataset.navigateGroup;
		}
		//assign a group index
		if(undefined == groupcounts[group]){
			groupcounts[group]=0;
		}
		let gi=parseInt(groupcounts[group])+1;
		groupcounts[group]=gi;
		navels[i].setAttribute('data-navigate-group-index',gi);
	}
	document.onkeydown=function(e){
		e=e||window.event;
		if(undefined == e){
			//console.log('initNavigate onkeydown - no e');
			return true;
		}
		let nav={};
		nav.keycode = e.which || e.keyCode || e.charCode; // To find out what key is this
		nav.key = String.fromCharCode(nav.keycode); //what char was pressed
		nav.shift = e.shiftKey; //was the shift key also pressed
		nav.alt = e.altKey; //was the alt key also pressed
		nav.ctrl = e.ctrlKey; //was the ctrl key also pressed
		nav.focus = '';
		//fix chars that are not letters
		switch(nav.keycode){
			case 8:nav.key='Backspace';break;
			case 9:nav.key='Tab';break;
			case 13:nav.key='Enter';break;
			case 33:nav.key='PageUp';break;
			case 34:nav.key='PageDown';break;
			case 35:nav.key='End';break;
			case 36:nav.key='Home';break;
			case 37:nav.key='Left';break;
			case 38:nav.key='Up';break;
			case 39:nav.key='Right';break;
			case 40:nav.key='Down';break;		
			case 45:nav.key='Insert';break;
			case 46:nav.key='Delete';break;

		}
		if(nav.shift){
			nav.focus='Shift+'+nav.key;
		}
		else if(nav.ctrl && nav.alt){
			nav.focus='Ctrl+Alt+'+nav.key;
		}
		else if(nav.alt){
			nav.focus='Alt+'+nav.key;
		}
		else if(nav.ctrl){
			nav.focus='Ctrl+'+nav.key;
		}
		else{
    		nav.focus=nav.key;
    	}
    	//console.log(nav);
    	if(nav.focus.length){
    		nav.el=document.querySelector('[data-navigate-focus="'+nav.focus+'" i]');
    		if(undefined != nav.el){
    			e.preventDefault();
	    		e.stopPropagation();
	    		nav.el.focus();
				simulateEvent(nav.el,'click');
	    		return false;
	    	}
    	}
		//skip if no element has focus
		let fel=document.activeElement;
		if(undefined==fel){
			//console.log('no active element');
			return true;
		}
		//skip if focus element is not a navigate element
		if(undefined == fel.dataset.navigate){
			//console.log('fel navigate not defined');
			return true;
		}
	    //call data-navigate-function if specified
	    if(undefined != fel.dataset.navigateAll){
	    	e.preventDefault();
	    	e.stopPropagation();
	    	let func=fel.dataset.navigateAll;
		    if(function_exists(func)){
	    		window[func](fel);
	    	}
	    	else{eval(func);}
	    	return false;
	    }
	    let index=parseInt(fel.dataset.navigate);
	    let group=fel.dataset.navigateGroup;
	    let gindex=parseInt(fel.dataset.navigateGroupIndex);
	    let next=gindex+1;
	    let nextel=document.querySelector('[data-navigate-group="'+group+'"][data-navigate-group-index="'+next+'"]');
	    let prev=gindex-1;
	    let prevel=document.querySelector('[data-navigate-group="'+group+'"][data-navigate-group-index="'+prev+'"]');
	    switch(parseInt(nav.keycode)){
	    	case 13:
	    		//enter
	    		if(undefined != fel.dataset.navigateEnter){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateEnter;
			    	let funcEl=document.querySelector(func);
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
			    	else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
	    	break;
	    	case 13:
	    		//tab
	    		if(undefined != fel.dataset.navigateTab){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateTab;
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
		    		else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
	    	break;

	    	case 38:
	    		//up
	    		if(undefined != fel.dataset.navigateUp){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateUp;
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
		    		else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
			    if(undefined != prevel){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	simulateEvent(fel,'mouseout');
			    	prevel.focus();
			    	prevel.setAttribute('data-navigate-key',nav.keycode);
			    	if(undefined != prevel.dataset.navigateClick){
			    		let clickFunc=prevel.dataset.navigateClick;
			    		if(clickFunc.length==0 || clickFunc=='false' || clickFunc.indexOf('return false')==0){
			    		//do nothing
				    	}
			    		else if(function_exists(clickFunc)){
				    		window[clickFunc](fel);
				    	}
				    	else{eval(clickFunc);}
				    	return false;
			    	}
			    	simulateEvent(prevel,'click');
					return false;
			    }
	    	break;
	    	case 40:
	    		//down
	    		if(undefined != fel.dataset.navigateDown){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateDown;
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
		    		else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
			    if(undefined != nextel){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	simulateEvent(fel,'mouseout');
			    	nextel.focus();
			    	nextel.setAttribute('data-navigate-key',nav.keycode);
			    	if(undefined != nextel.dataset.navigateClick){
			    		let clickFunc=nextel.dataset.navigateClick;
			    		if(clickFunc.length==0 || clickFunc=='false' || clickFunc.indexOf('return false')==0){
			    		//do nothing
				    	}
			    		else if(function_exists(clickFunc)){
				    		window[clickFunc](fel);
				    	}
				    	else{eval(clickFunc);}
				    	return false;
			    	}
			    	simulateEvent(nextel,'click');
					return false;
			    }
	    	break;
	    	case 39:
	    		//right
	    		if(undefined != fel.dataset.navigateRight){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateRight;
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
			    	else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
	    		if(undefined != nextel){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	simulateEvent(fel,'mouseout');
			    	nextel.focus();
			    	nextel.setAttribute('data-navigate-key',nav.keycode);
			    	if(undefined != nextel.dataset.navigateClick){
			    		let clickFunc=nextel.dataset.navigateClick;
			    		if(clickFunc.length==0 || clickFunc=='false' || clickFunc.indexOf('return false')==0){
			    		//do nothing
				    	}
			    		else if(function_exists(clickFunc)){
				    		window[clickFunc](fel);
				    	}
				    	else{eval(clickFunc);}
				    	return false;
			    	}
			    	simulateEvent(nextel,'click');
					return false;
			    }
	    	break;
	    	case 37:
	    		//left
	    		if(undefined != fel.dataset.navigateLeft){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	let func=fel.dataset.navigateLeft;
			    	if((func.indexOf('Ctrl')==0 || func.indexOf('Alt')==0) && func.indexOf('+') != -1){
			    		return navigateSetFocus(func);
			    	}
		    		else if(func.length==0 || func=='false' || func.indexOf('return false')==0){
			    		//do nothing
			    	}
			    	else if(func.indexOf('group:')==0){
			    		let group=func.replace('group:','');
			    		return navigateSetFocusGroup(group);
			    	}
		    		else if(function_exists(func)){
			    		window[func](fel);
			    	}
			    	else{eval(func);}
			    	return false;
			    }
			    if(undefined != prevel){
			    	e.preventDefault();
			    	e.stopPropagation();
			    	simulateEvent(fel,'mouseout');
			    	prevel.focus();
			    	prevel.setAttribute('data-navigate-key',nav.keycode);
			    	if(undefined != prevel.dataset.navigateClick){
			    		let clickFunc=prevel.dataset.navigateClick;
			    		if(clickFunc.length==0 || clickFunc=='false' || clickFunc.indexOf('return false')==0){
			    		//do nothing
				    	}
			    		else if(function_exists(clickFunc)){
				    		window[clickFunc](fel);
				    	}
				    	else{eval(clickFunc);}
				    	return false;
			    	}
			    	simulateEvent(prevel,'click');
					return false;
			    }
	    	break;
	    }
	 };
	 return true;
}
function navigateSetFocusGroup(group){
	let el=document.querySelector('[data-navigate-group="'+group+'" i]');
	if(undefined != el){
		el.focus();
		simulateEvent(el,'click');
	}
	return false;
}
function navigateHideAndSetFocusGroup(hide,group){
	hideId(hide);
	let el=document.querySelector('[data-navigate-group="'+group+'" i]');
	if(undefined != el){
		el.focus();
		simulateEvent(el,'click');
	}
	return false;
}
function navigateSetFocus(focus){
	let el=document.querySelector('[data-navigate-focus="'+focus+'" i]');
	if(undefined != el){
		el.focus();
		simulateEvent(el,'click');
	}
	return false;
}
function navigateHideAndSetFocus(hide,focus){
	hideId(hide);
	let el=document.querySelector('[data-navigate-focus="'+focus+'" i]');
	if(undefined != el){
		el.focus();
		simulateEvent(el,'click');
	}
	return false;
}
function cancel(e) {
      if (e.preventDefault) { e.preventDefault(); }
      return false;
    }
function stickyMenus(){
	var list = GetElementsByAttribute('*','data-behavior','sticky');
	var scrollPosition=getWindowScrollPosition();
	//console.log('stickyMenus found '+list.length+' matches');
	for(var i=0;i<list.length;i++){
		var sticky_start=list[i].getAttribute('sticky_y');
		if(scrollPosition >= sticky_start && list[i].style.position != "fixed"){
			list[i].style.position = "fixed";
			list[i].style.top = 0;
			list[i].style.width = '100%';
			list[i].style.zIndex = 99999;
			if(undefined != list[i].id){
				fadeIn(list[i].id);
			}
		}
		if(scrollPosition < sticky_start && list[i].style.position != "relative"){
			list[i].style.position = "relative";
			list[i].style.top = "";
			list[i].style.width = "";
			if(undefined != list[i].getAttribute('sticky_z')){
				list[i].style.zIndex = list[i].getAttribute('sticky_z');
			}
			else{
            	list[i].style.zIndex='';
			}
		}
	}
}
//remove tinymce
function removeTinyMCE(id){
	if (tinyMCE.getInstanceById(id)){
		tinyMCE.execCommand('mceRemoveControl', false, id);
	}
}
// Add initBehaviors to the onLoad queue
addEventHandler(window,'load',initBehaviors);


function addOnLoadEvent(f){
	addEventHandler(window,'load',f);
}
//generic addEvent for all browsers - depreciated use addEventHandler instead
function addEvent(elem, evnt, func){
	return addEventHandler(elem, evnt, func);
}
function addEventHandler(elem,evnt, func){
	if (elem.addEventListener){
		// W3C DOM
		elem.addEventListener(evnt,func,commonPassiveEventListener(false));
	}
	else if (elem.attachEvent){
   		// IE DOM
   		elem.attachEvent("on"+evnt, func);
   }
   else {
   		// Not IE or W3C - try generic
		elem['on'+evnt] = func;
   }
}
//generic remove Event handler for all browsers - depreciated use removeEventHandler instead
function removeEvent(elem, evnt, func){
	return removeEventHandler(elem, evnt, func);
}
function removeEventHandler(elem,evnt, func){
	if (elem.removeEventListener){
		// W3C DOM
		elem.removeEventListener(evnt,func,false);
	}
	else if (elem.detachEvent){
   		// IE DOM
   		elem.detachEvent("on"+evnt, func);
   }
   else {
   		// Not IE or W3C - try generic
		elem['on'+evnt] = {};
   }
}


function executeFunctionByName(functionName, context /*, args */) {
	if(undefined == context){context='window';}
	var args = [].slice.call(arguments).splice(2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for(var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(this, args);
}
var tinymceInitialized=0;
function tinymceInitialize(txtid,px){
	//initialize the tinyMCE editor instance so we can add editor instances.
	//reference: http://blog.mirthlab.com/2008/11/13/dynamically-adding-and-removing-tinymce-instances-to-a-page/
	var bar1="bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,|,bullist,numlist,outdent,indent,|,charmap,image,media,link,unlink,formatselect,code,fullscreen,fontsizeselect";
	var bar2="";
	var bar3="";
	var ok=tinyMCE.init({
		// General options
		mode : "none",
    	//elements : txtid,
		theme : "advanced",
		plugins : "table,advhr,inlinepopups,contextmenu,media,paste,fullscreen,visualchars,nonbreaking,xhtmlxtras,template,advlist,advimage",
		submit_patch : false,
		paste_auto_cleanup_on_paste : true,
		paste_text_replacements : [
			[/\u2026/g, "..."],
			[/[\x93\x94\u201c\u201d]/g, '"'],
			[/[\x60\x91\x92\u2018\u2019]/g, "'"],
			[ /.*((https?|ssh|ftp|file):\/\/\S+).*/gi, '<a href="$1">$1</a>' ],
        	[ /.*((https?|ssh|ftp|file):\/\/\S+((\.)bmp|gif|jpe?g|png|psd|tif?f)).*/gi, '<img src="$1" alt="image" />' ]
		],

		// Theme options
		theme_advanced_buttons1 : bar1,
		theme_advanced_buttons2 : bar2,
		theme_advanced_buttons3 : bar3,
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_resizing : true
		});
	}
function fullScreenToggle(id){
	//info:toggle a div to full screen and back
	var obj=getObject(id);
	if(undefined==obj){return false;}
	var set=obj.getAttribute('fullscreen');
	if(undefined == set || set==0){
		var wh=getWidthHeight(obj);
		obj.setAttribute('fullscreen',1);
		obj.setAttribute('width_ori',wh[0]);
		obj.setAttribute('height_ori',wh[1]);
		obj.style.width=document.body.clientWidth+'px';
		obj.style.height=document.body.clientHeight+'px';
	}
	else{
		obj.setAttribute('fullscreen',0);
		obj.style.width=obj.getAttribute('width_ori')+'px';
		obj.style.height=obj.getAttribute('height_ori')+'px';
	}
}
function floatDiv(id,t,b){
	//info: makes specified object or id float at t,b
	var obj=getObject(id);
	var top=0;
	if(undefined != obj.parentNode && parseInt(obj.parentNode.scrollTop) > 0){top=parseInt(obj.parentNode.scrollTop);}
	else if(undefined != document.documentElement && parseInt(document.documentElement.scrollTop) > 0){top=parseInt(document.documentElement.scrollTop);}
	else if(undefined != document.body && parseInt(document.body.scrollTop) > 0){top=parseInt(document.body.scrollTop);}
	else{return false;}
	var stay=parseInt(t);
	var newtop=Math.round(top+stay);
	obj.style.top=newtop+'px';
    setTimeout("floatDiv('"+id+"','"+t+"')",250);
	}

function addDragToTextarea(sid){
	//info: makes specified textarea resizable by dragging bottom right corner
	var obj = document.getElementById(sid);
	//get select object width.
	var w=Math.round(obj.offsetWidth+10);
	var dragarea=obj.id+'_dragarea';
	var dragcheckbox=obj.id+'_dragcheckbox';
	var cx=findPosX(obj);
	var cy=findPosY(obj);
	var xpos=Math.round(cx+obj.offsetWidth-6);
	var ypos=Math.round(cy+obj.offsetHeight-12);
	var html = '<span parentid="'+sid+'" textareadrag="1" id="'+dragarea+'" style="position:absolute;left:'+xpos+'px;top:'+ypos+'px;cursor:crosshair;color:#7F9DB9;font-size:13pt;font-family:times;" title="Drag to adjust size">&#9688;</span>';
	var pobj=getParent(obj);
   	pobj.insertAdjacentHTML('beforeEnd',html);
   	var dragobj=document.getElementById(dragarea);
	Drag.init(dragobj);
	//var valcnt=obj.length;
	//var w=Math.round(obj.offsetWidth-6);
	dragobj.onDrag = function(x, y) {
		var pid = this.getAttribute('parentid');
		var obj = document.getElementById(pid);
		var w=Math.round(x-cx+6);
		var h=Math.round(y-cy+12);
		if(w > 0){obj.style.width = w+'px';}
		if(h > 0){obj.style.height = h+'px';}
		/*Look for any other dragable items and reset their position*/
  		var cid=this.id;
		var dragObjs = GetElementsByAttribute('span', 'textareadrag', '1');
  		for (var n=0; n<dragObjs.length; n++) {
	   		if(dragObjs[n].id != cid){
				var parentid = dragObjs[n].getAttribute('parentid');
				//window.status=cid+","+dragObjs[n].id+","+parentid;
    				if(undefined != parentid){
					var cpobj = document.getElementById(parentid);
					var px=findPosX(cpobj);
					var py=findPosY(cpobj);
					var cxpos=Math.round(px+cpobj.offsetWidth-6);
					var cypos=Math.round(py+cpobj.offsetHeight-12);
					dragObjs[n].lastMouseX=cxpos;
					dragObjs[n].lastMouseY=cypos;
					dragObjs[n].style.left=cxpos+'px';
					dragObjs[n].style.top=cypos+'px';
		              }
		 		}
		 	}
		}
   	}
// Remember the current position.
function storeCaret(text)
{
	// Only bother if it will be useful.
	if (typeof(text.createTextRange) != 'undefined'){
		text.caretPos = document.selection.createRange().duplicate();
		}
}

// Replaces the currently selected text with the passed text.
function replaceText(text, textarea)
{
	// Attempt to create a text range (IE).
	if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange)
	{
		var caretPos = textarea.caretPos;

		caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
		caretPos.select();
	}
	// Mozilla text range replace.
	else if (typeof(textarea.selectionStart) != "undefined")
	{
		var begin = textarea.value.substr(0, textarea.selectionStart);
		var end = textarea.value.substr(textarea.selectionEnd);
		var scrollPos = textarea.scrollTop;

		textarea.value = begin + text + end;

		if (textarea.setSelectionRange)
		{
			textarea.focus();
			textarea.setSelectionRange(begin.length + text.length, begin.length + text.length);
		}
		textarea.scrollTop = scrollPos;
	}
	// Just put it on the end.
	else
	{
		textarea.value += text;
		textarea.focus(textarea.value.length - 1);
	}
}

// Surrounds the selected text with text1 and text2.
function surroundText(text1, text2, textarea){
	//info: Surrounds the selected text with text1 and text2
	// Can a text range be created?
	if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange)
	{
		var caretPos = textarea.caretPos;

		caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;
		caretPos.select();
	}
	// Mozilla text range wrap.
	else if (typeof(textarea.selectionStart) != "undefined")
	{
		var begin = textarea.value.substr(0, textarea.selectionStart);
		var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
		var end = textarea.value.substr(textarea.selectionEnd);
		var newCursorPos = textarea.selectionStart;
		var scrollPos = textarea.scrollTop;

		textarea.value = begin + text1 + selection + text2 + end;

		if (textarea.setSelectionRange)
		{
			if (selection.length == 0)
				textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
			else
				textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
			textarea.focus();
		}
		textarea.scrollTop = scrollPos;
	}
	// Just put them on the end, then.
	else
	{
		textarea.value += text1 + text2;
		textarea.focus(textarea.value.length - 1);
	}
}

function insertAtCursor(myField, myValue) {
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } 
    else {
        myField.value += myValue;
    }
    return false;
}

// Checks if the passed input's value is nothing.
function isEmptyText(theField){
	// Copy the value so changes can be made..
	var theValue = theField.value;

	// Strip whitespace off the left side.
	while (theValue.length > 0 && (theValue.charAt(0) == ' ' || theValue.charAt(0) == '\t'))
		theValue = theValue.substring(1, theValue.length);
	// Strip whitespace off the right side.
	while (theValue.length > 0 && (theValue.charAt(theValue.length - 1) == ' ' || theValue.charAt(theValue.length - 1) == '\t'))
		theValue = theValue.substring(0, theValue.length - 1);

	if (theValue == ''){return true;}
	else{return false;}
}
/*http://www.quirksmode.org/js/findpos.html*/
function findPosX(xobj){
	var curleft = 0;
	if (xobj.offsetParent){
		while (xobj.offsetParent){
			curleft += xobj.offsetLeft;
			xobj = xobj.offsetParent;
			}
		}
	else if (xobj.x){curleft += xobj.x;}
	return curleft;
	}

function findPosY(yobj){
	var curtop = 0;
	if (yobj.offsetParent){
		while (yobj.offsetParent){
			curtop += yobj.offsetTop;
			yobj = yobj.offsetParent;
			}
		}
	else if (yobj.y){curtop += yobj.y;}
	return curtop;
	}
/* timeClock - */
var TimoutArray=new Array();
function slideShow(divid,idx,s){
	//info: creates a slideshow using image tags found in divid
	if(undefined == s){s=15;}
	var ms=Math.round(s*1000);
	idx=Math.round(idx+0)
	var divobj=getObject(divid);
	var transition=navEls[n].dataset.transition || navEls[n].getAttribute('transition');
	id='slideshow'+divid;
	clearTimeout(TimoutArray[id]);
	if(isMouseOver(divid)){
		TimoutArray[id]=setTimeout("slideShow('"+divid+"',"+idx+","+s+")",ms);
		return;
	}
	var tag=divobj.getAttribute('data-tag');
	if(undefined == tag){tag='img';}
	var objs=divobj.getElementsByTagName(tag);
	if(objs.length==0){
		alert('SlideShow Error: - No '+tag+' elements found');
		return false;
		}
	if(idx == objs.length){idx=0;}
	for (var i=0; i<objs.length; i++) {
		var caption=objs[i].getAttribute('data-caption');
		if(undefined != transition && undefined == objs[i].getAttribute('data-transition')){
			objs[i].setAttribute('data-transition',transition);
		}
		objs[i].id='w_slide';
		setStyle(objs[i],'display','block');
		if(undefined == caption){caption='';}
		var navobj=getObject(divid+'_nav');
		if(i==idx){
			addClass(objs[i],'opaque');
			//check for data-function
			if(undefined != objs[i].getAttribute('data-function')){
				var functionName=objs[i].getAttribute('data-function');
				window[functionName](objs[i]);
			}
			if(undefined != navobj){
            	var navdiv=getObject(divid+'_nav_'+i);
            	addClass(navdiv,'active');
			}
		}
		else{
			removeClass(objs[i],'opaque');
			if(undefined != navobj){
            	var navdiv=getObject(divid+'_nav_'+i);
            	removeClass(navdiv,'active');
			}
			caption='';
		}
		setText(divid+'_caption',caption);
	}
	idx=Math.round(idx+1);
    TimoutArray[id]=setTimeout("slideShow('"+divid+"',"+idx+","+s+")",ms);
	}
function stopWatch(id){
	clearTimeout(TimoutArray[id]);
	var obj=getObject(id);
	if(undefined==obj){return false;}
	if(obj.dataset.behavior.indexOf('stopwatch')==-1){
		return false;
	}
	if(undefined != obj.dataset.stop && parseInt(obj.dataset.stop)==1){
		return false;
	}
	//Get the start time from the value of id.  HH:MM:SS
	var stime=getText(id);
	var hour=0;
	var min=0;
	var sec=0;
	if(stime.length){
		var parts=stime.split(':');
		hour=parseInt(parts[0]);
		min=parseInt(parts[1]);
		sec=parseInt(parts[2]);
    	}
    sec++;
    //window.status=stime+'-'+hour+','+min+','+sec;
    if (sec == 60) {sec = 0; min++;}
  	if (min == 60){min = 0; hour++;}
	if (hour<=9) { hour = "0" + hour; }
	if (min<=9) { min = "0" + min; }
	if (sec<=9) { sec = "0" + sec; }
   	var newtext = hour + ":" + min + ":" + sec;
	setText(id,newtext);
    //set the timer
    TimoutArray[id]=setTimeout("stopWatch('"+id+"')",1000);
	}
function ajaxTimer(id){
	//info: used by ajax behavior
	//info: create an object with skip_ajax_timer as the id to skip
	clearTimeout(TimoutArray[id]);

	var obj=getObject(id);
	if(undefined == obj){return;}
	var attr=getAllAttributes(obj);
	var number;
	if(undefined != attr['data-countdown']){number=parseInt(attr['data-countdown']);}
	else if(undefined != attr['countdown']){number=parseInt(attr['countdown']);}
	else if(undefined != attr['data-timer']){number=parseInt(attr['data-timer']);}
	else if(undefined != attr['timer']){number=parseInt(attr['timer']);}

	else{
		//default to 75 seconds
    	number=75;
	}
	number--;
	obj.setAttribute('data-countdown',number);
	var timer;
	if(undefined != attr['data-timer']){timer=parseInt(attr['data-timer']);}
	else if(undefined != attr['timer']){timer=parseInt(attr['timer']);}
	else{
		//default to 75 seconds
    	timer=75;
	}
	//check for skip attribute on page
	var skip=0;
	if(undefined != document.activeElement && undefined != document.activeElement.type && document.activeElement.type.indexOf('text') != -1){
		skip=1;
	}
	else if(undefined != getObject('skip_ajax_timer')){skip=1;}
	obj.setAttribute('data-skip',skip);
	if(skip==0 && number <= 0){
		if(undefined != attr['url'] || undefined != attr['data-url']){
			var url;
			if(undefined != attr['url']){url=attr['url'];}
			else{url=attr['data-url'];}
    		//call ajax and reset the countdown timer
			var parts=url.split('?');
			var params={};
			if(undefined != parts[1]){params=JSON.parse('{"' + decodeURI(parts[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');}
			params['showprocessing']=false;
			params['timer']=timer;
			ajaxGet(parts[0],attr['id'],params);
		}
		else if(undefined != attr['function'] || undefined != attr['data-function']){
        	//run a function instead
        	var func;
			if(undefined != attr['function']){func=attr['function'];}
			else{func=attr['data-function'];}
			let jsfunc=new Function(func);
    		jsfunc();
		}
		//reset the timer
		obj.setAttribute('data-countdown',timer);
	}
	TimoutArray[id]=setTimeout("ajaxTimer('"+id+"')",1000);
}
function countDown(id){
	//info: used by countdown behavior
	clearTimeout(TimoutArray[id]);
	let obj=getObject(id);
	if(undefined == obj){return;}
	let debug=0;
	if(undefined != obj.getAttribute('data-debug')){
		debug=parseInt(obj.getAttribute('data-debug'));
	}
	if(debug==1){console.log(Array('countDown object',obj));}
	//Get the start time from the value of id.  HH:MM:SS
	let number=getText(obj);
	if(debug==1){console.log(Array('countDown number is ',number));}
	number=parseInt(number);
	number--;
	setText(obj,number);
	if(debug==1){console.log(Array('countDown set number to ',number));}
    let cb='';
    if(undefined != obj.getAttribute('data-callback')){
    	cb=obj.getAttribute('data-callback');
    }
    else if(undefined != obj.getAttribute('callback')){
    	cb=obj.getAttribute('callback');
    }
    let stop=0;
    if(cb.length > 0){
    		let cbfunc=cb+"('"+id+"','"+number+"')";
    		let jsfunc=new Function(cbfunc);
    		jsfunc();
	}
	else if(number == 0){
		if(undefined != obj.dataset.end){
			let func=obj.dataset.end;
			console.log(func);
		    	if(function_exists(func)){
	    			window[func](obj);
	    		}
	    		else{
	    			let fn=new Function(func)();
	    			console.log(fn);
	    		}
		}
		else if(undefined != obj.dataset.onzero){
			let func=obj.dataset.onzero;
		    	if(function_exists(func)){
	    			window[func](obj);
	    		}	
		}
		stop=1;
	}
	if(stop==0){
		TimoutArray[id]=setTimeout("countDown('"+id+"')",1000);
	}
}
function countDownDate(divid,yr,m,d,hr,min,tz){
	//info: used by countdowndate behavior
	let divobj=getObject(divid);
	if(undefined==divobj){
		return;
	}
	//a will be today and b will be the dataset defined date
	let a=new Date();
	let bstr=divobj.dataset.year+'-'+divobj.dataset.month+'-'+divobj.dataset.day;
	if(undefined != divobj.dataset.hour){
		bstr=bstr+' '+divobj.dataset.hour+':'+divobj.dataset.minute;
	}
	if(undefined != divobj.dataset.second){
		bstr=bstr+':'+divobj.dataset.second;
	}
	else{
		bstr=bstr+':00';
	}
	if(undefined != divobj.dataset.tz){
		bstr=bstr+' '+divobj.dataset.tz;
	}
	let b=new Date(bstr)
	if(undefined == b){
		setText(divobj,'Date Conversion Error: '+bstr);
		return;
	}
	let utca = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(),a.getHours(),a.getMinutes(),a.getSeconds());
  	let utcb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(),b.getHours(),b.getMinutes(),b.getSeconds());
  	//difference
  	let dd=utcb-utca;
	let dday=Math.floor(dd/(60*60*1000*24)*1);
	let dhour=Math.floor((dd%(60*60*1000*24))/(60*60*1000)*1);
	let dmin=Math.floor(((dd%(60*60*1000*24))%(60*60*1000))/(60*1000)*1);
	let dsec=Math.floor((((dd%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1);
	//display
	if(dday<=0&&dhour<=0&&dmin<=0&&dsec<=0){
		divobj.style.display='none';
		return;
	}
	else {
		let dd=dday;
		let dh=dhour;
		let dm=dmin;
		let ds=dsec;
		if (dday<=9) { dday = "0" + dday; }
		if (dhour<=9) { dhour = "0" + dhour; }
		if (dmin<=9) { dmin = "0" + dmin; }
		if (dsec<=9) { dsec = "0" + dsec; }
		let rtn='<table  class="w_countdown">'+"\r\n";
		rtn+='<tr align="center">';
		if(dd > 0){rtn+='<th>'+dday+'</th>';}
		if(dh > 0 || dd > 0){rtn+='<th>'+dhour+'</th>';}
		if(dm > 0 || dh > 0 || dd > 0){rtn+='<th>'+dmin+'</th>';}
		if(ds > 0 || dm > 0 || dh > 0 || dd > 0){rtn+='<th>'+dsec+'</th>';}
		rtn+='</tr>'+"\r\n";
		rtn+='<tr align="center">';
		if(dd > 0){rtn+='<td>Day</td>';}
		if(dh > 0 || dd > 0){rtn+='<td>Hour</td>';}
		if(dm > 0 || dh > 0 || dd > 0){rtn+='<td>Min</td>';}
		if(ds > 0 || dm > 0 || dh > 0 || dd > 0){rtn+='<td>Sec</td>';}
		rtn+='</tr>'+"\r\n";
		rtn+='</table>'+"\r\n";
		setText(divobj,rtn);
		setTimeout(countDownDate,1000,divid);
	}
}
function countdownTime(id){
	//hh:mm:ss
	let el=getObject(id);
	if(undefined == el){return false;}
	let timeArray=el.innerText.split(/[:]+/);
	let c=new Date();
	let repeat=1;
	if(undefined != el.dataset.paused){
		if(parseInt(el.dataset.paused)==1){
			this.timer=window.setTimeout(countdownTime,1000,id);
			return;
		}
	}
	if(timeArray.length==3){
		//hh:mm:ss
		let t=new Date(c.getFullYear(),c.getMonth(),c.getDay(),timeArray[0],timeArray[1],timeArray[2]-1);
		let h=t.getHours();
		let m=t.getMinutes();
		let s=t.getSeconds();
		if(h==0 && m==0 && s==0){repeat=0;}
		if(h.toString().length==1){h='0'+h;}
		if(m.toString().length==1){m='0'+m;}
		if(s.toString().length==1){s='0'+s;}
		if(repeat==0){
			el.innerHTML='00:00:00';
			if(undefined != el.dataset.end){
				let func=el.dataset.end;
			    if(function_exists(func)){
		    		window[func](el);
		    	}
			}
		}
		else{el.innerText=h+':'+m+':'+s;}
	}
	else if(timeArray.length==2){
		//mm:ss
		let t=new Date(c.getFullYear(),c.getMonth(),c.getDay(),c.getHours(),timeArray[0],timeArray[1]-1);
		let m=t.getMinutes();
		let s=t.getSeconds();
		if(m==0 && s==0){repeat=0;}
		if(m.toString().length==1){m='0'+m;}
		if(s.toString().length==1){s='0'+s;}
		if(repeat==0){
			el.innerHTML='00:00';
			if(undefined != el.dataset.end){
				let func=el.dataset.end;
			    if(function_exists(func)){
		    		window[func](el);
		    	}
			}
		}
		else{el.innerText=m+':'+s;}
	}
	if(repeat==1){
		if(undefined != this.timer){clearTimeout(this.timer);}
		this.timer=window.setTimeout(countdownTime,1000,id);
	}
}
function countdownBeep(){
	let snd = new Audio("data:audio/flac;base64,ZkxhQwAAACISABIAAAcdABkyC7gC8AAAuwzs47v+nBAkGvgmZbF/F+ymBAAAKCAAAAByZWZlcmVuY2UgbGliRkxBQyAxLjEuMCAyMDAzMDEyNgAAAACBABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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");  
    snd.play();	

}
function startClock(id,live){
	clearTimeout(TimoutArray[id]);
    var dt = new Date();
    var h=dt.getHours();
    var m=dt.getMinutes();
    var s=dt.getSeconds();
    var p=" am";
    if(h > 12){h=h-12;p=" pm";}
    if(h==12){p=" pm";}
    var timestr='';
    if(h<10){timestr +="0";}
    timestr += h;
    timestr += ":";
    if(m<10){timestr +="0";}
    timestr += m;
	timestr += ":";
    if(s<10){timestr +="0";}
	timestr += s;
    timestr +=p;
    setText(id,timestr);
    if(live){
    	TimoutArray[id]=setTimeout("startClock('"+id+"',"+live+")",1000);
    }
}
function timerVerbose(id,live){
	var obj=getObject(id);
	if(undefined == obj){return false;}
	var s=parseInt(obj.getAttribute('timer_verbose'));
	setText(obj,verboseTime(s));
	s=s+1;
	obj.setAttribute('timer_verbose',s);
	clearTimeout(TimoutArray[id]);
    if(live){
    	TimoutArray[id]=setTimeout("timerVerbose('"+id+"',"+live+")",1000);
    }
}
function startUTCClock(id,live){
	if(undefined == live){live=false;}
	clearTimeout(TimoutArray[id]);
	obj=getObject(id);
	var offset=Math.round(obj.getAttribute('data-offset'));
    var dt = new Date();
    if(dt.isDST()){
		offset=Math.round(obj.getAttribute('data-offset-dst'));
		if(undefined == offset){
        	offset=Math.round(obj.getAttribute('data-offset'));
		}
	}

	var h=dt.getUTCHours();
	if(dt.getDate()!=dt.getUTCDate()){
	    h+=24;
	}
	var h=h+offset;
    var m=dt.getUTCMinutes();
    var s=dt.getUTCSeconds();
    var p=" am";
    if(h > 24){h=h-24;p='am';}
    else if(h > 12){h=h-12;p='pm';}
    else if(h==12){p='pm';}
    var format=obj.getAttribute('data-format') || 'h:m:s p';
    //set the timer based on if they need seconds or not
    var t=1000;
    if(format.indexOf('s') == -1){
		//no seconds to show  so only run it 4 times a minute
		t=15000;
		}
    var parts=new Array();
    //hour
    if(format.indexOf('h') != -1){
	    format=format.replace('h',h);
	}
    //minute
    if(format.indexOf('m') != -1){
    	if(m<10){m ='0'+m;}
    	format=format.replace('m',m);
    }
    //seconds
    if(format.indexOf('s') != -1){
    	if(s<10){s ='0'+s;}
    	format=format.replace('s',s);
    }
    //am pm
    if(format.indexOf('p') != -1){
    	format=format.replace('p',p);
    }
    //set the new clock time
    setText(id,format);
    //if live, set a timer.
    if(live){
    	TimoutArray[id]=setTimeout("startUTCClock('"+id+"',"+live+")",t);
    	}
	}
function startRaid(id,raidid){
	clearTimeout(TimoutArray[id]);
    setText(id,getText(raidid));
    TimoutArray[id]=setTimeout("startRaid('"+id+"','"+raidid+"')",250);
	}
function startSum(id,sumid){
	clearTimeout(TimoutArray[id]);
	var sumIds = GetElementsByAttribute('*', 'id', sumid);
	var sum=0;
	for (var s=0; s<sumIds.length; s++) {
		var cval=getText(sumIds[s]);
		/*alert(cval);*/
    	var val=Math.round(cval);
    	sum=sum+val;
 		}
	setText(id,sum);
    TimoutArray[id]=setTimeout("startSum('"+id+"','"+sumid+"')",250);
	}
function detectLeftButton(evt) {
    evt = evt || window.event;
    var button = evt.which || evt.button;
    return button == 1;
}
function doMath(id){
	/*
		@math(one+two+three)  @math(one+(two*3))             one+(two*3)
	*/
	var behavior=document.getElementById(id).getAttribute('data-behavior').toLowerCase();
	var re = new RegExp('^\@([a-z]+)[(](.+)[)]$', 'igm');
	var str;
	var res=re.exec(behavior);
	if (res && res.length > 0){
		var func=res[1].toLowerCase();
		var str=res[2].toLowerCase();
		var result=0;
		var mre = new RegExp('([a-z0-9\_]+)', 'igm');
		while(mres=mre.exec(str)){
			if (mres && mres.length > 0){
				var mname=mres[1];
				var txt=getText(mres[1]);
				//alert('replace '+mname+' with '+txt);
				var evalstr='str.replace(/'+mname+'/,\''+txt+'\')';
				let jsfunc=new Function(evalstr);
    			str=jsfunc();
				}
			}
		//window.status=str;
		try{
			let jsfunc=new Function(str);
    		str=jsfunc();
			setText(id,str);
			}
		catch(err){
			setText(id,err);
        	}
	}
}
function stopTimeout(id){
	clearTimeout(TimoutArray[id]);
}

//CheckMouseEnter  - returns true if the mouse is over the element
function checkMouseEnter (element, evt) {
	if (element.contains && evt.fromElement) {
	     return !element.contains(evt.fromElement);
	}
	else if (evt.relatedTarget) {
	   	return !containsDOM(element, evt.relatedTarget);
	}
}

// checkMouseLeave - returns true if the mouse is no longer over the element
function checkMouseLeave (element, evt) {
	   //window.status=evt;
	   //return;
	   if (element.contains && undefined != evt.toElement) {
	        return !element.contains(evt.toElement);
		   }
	   else if (evt.relatedTarget) {
		   return !containsDOM(element, evt.relatedTarget);
		   }
	   }

//containsDOM - does container have containee
function containsDOM (container, containee) {
	var isParent = false;
	do {
	     if ((isParent = container == containee)){break;}
		containee = containee.parentNode;
	}
 	while (containee != null);
	return isParent;
}
function isOver(dragId,containerId){
	var dragPos=getPos(dragId);
	var dw=getWidth(dragId);
	var dx=dragPos.x+parseInt(dw/2);
	var contPos=getPos(containerId);
	var w=getWidth(containerId);
	var h=getHeight(containerId);
	var lft=contPos.x+w;
	var h=contPos.y+h;
	if(dx > contPos.x && dx < lft && dragPos.y > contPos.y && dragPos.y < h){return true;}
	return false;
}
//Drag library from http://www.aaronboodman.com/
//		https://github.com/aboodman/dom-drag
//	Note: modifications made to handle evaluating funcions when a div is dropped on
var Drag = {
	obj : null,
	init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
	{
		o=getObject(o);
		o.onmousedown	= Drag.start;
		o.hmode			= bSwapHorzRef ? false : true ;
		o.vmode			= bSwapVertRef ? false : true ;

		o.root = oRoot && oRoot != null ? oRoot : o ;

		if (o.hmode  && isNaN(parseInt(o.root.style.left  ))){o.root.style.left   = "0px";}
		if (o.vmode  && isNaN(parseInt(o.root.style.top   ))){o.root.style.top    = "0px";}
		if (!o.hmode && isNaN(parseInt(o.root.style.right ))){o.root.style.right  = "0px";}
		if (!o.vmode && isNaN(parseInt(o.root.style.bottom))){o.root.style.bottom = "0px";}

		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		o.startX=x;
		o.startY=y;

		o.minX	= typeof minX != 'undefined' ? minX : null;
		o.minY	= typeof minY != 'undefined' ? minY : null;
		o.maxX	= typeof maxX != 'undefined' ? maxX : null;
		o.maxY	= typeof maxY != 'undefined' ? maxY : null;

		o.xMapper = fXMapper ? fXMapper : null;
		o.yMapper = fYMapper ? fYMapper : null;

		o.onmouseover= function(){this.style.cursor='move';}

		o.root.onDragStart	= new Function();
		o.root.onDragEnd	= new Function();
		o.root.onDrag		= new Function();
	},

	start : function(e)
	{
		var o = Drag.obj = this;
		e = Drag.fixE(e);
		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		o.root.onDragStart(x, y);
		Drag.obj.lastX=x;
		Drag.obj.lastY=y;
		o.lastMouseX	= e.clientX;
		o.lastMouseY	= e.clientY;

		if (o.hmode) {
			if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
			if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
		} else {
			if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
			if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
		}

		if (o.vmode) {
			if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
			if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;
		} else {
			if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
			if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
		}

		document.onmousemove	= Drag.drag;
		document.onmouseup		= Drag.end;

		return false;
	},

	drag : function(e)
	{
		e = Drag.fixE(e);
		var o = Drag.obj;

		var ey	= e.clientY;
		var ex	= e.clientX;
		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		var nx, ny;

		if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
		if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
		if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
		if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

		nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
		ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

		if (o.xMapper)		nx = o.xMapper(y)
		else if (o.yMapper)	ny = o.yMapper(x)
		Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
		Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
		Drag.obj.lastMouseX	= ex;
		Drag.obj.lastMouseY	= ey;
		Drag.obj.root.onDrag(nx, ny);
		//Am I over any object with an _ondragover attribute?  _ondragover="functionName", this function get get the attributes of targetdiv and dropdiv
		var navEls = GetElementsByAttribute('*', '_ondragover', '.+');
		for (var n=0; n<navEls.length; n++){
			if(isOver(Drag.obj,navEls[n])){
				var dofunc=navEls[n].getAttribute('_ondragover');
				navEls[n].setAttribute('_dragover',1);
				//gather attributes of both elements
				var targetdiv=new Object();
				for(var a=0;a<navEls[n].attributes.length;a++){
					var attrib=navEls[n].attributes[a];
					targetdiv[attrib.name]=attrib.value;
                	}
                var dropdiv=new Object();
                for(var a=0;a<Drag.obj.root.attributes.length;a++){
					var attrib=Drag.obj.root.attributes[a];
					dropdiv[attrib.name]=attrib.value;
                	}
                dropdiv.startX=Drag.obj.startX;
                dropdiv.startY=Drag.obj.startY;
				window[dofunc](targetdiv,dropdiv);
            	}
            else{
				//handle _ondragout
				var dragover=navEls[n].getAttribute('_dragover');
				if(undefined != dragover && dragover==1 && undefined != navEls[n].getAttribute('_ondragout')){
					navEls[n].setAttribute('_dragover',0);
					var dofunc=navEls[n].getAttribute('_ondragout');
					//gather attributes of both elements
					var targetdiv=new Object();
					for(var a=0;a<navEls[n].attributes.length;a++){
						var attrib=navEls[n].attributes[a];
						targetdiv[attrib.name]=attrib.value;
	                	}
	                var dropdiv=new Object();
	                for(var a=0;a<Drag.obj.root.attributes.length;a++){
						var attrib=Drag.obj.root.attributes[a];
						dropdiv[attrib.name]=attrib.value;
	                	}
	                dropdiv.startX=Drag.obj.startX;
	                dropdiv.startY=Drag.obj.startY;
					window[dofunc](targetdiv,dropdiv);
					}
            	}
        	}
		return false;
	},

	end : function()
	{
		document.onmousemove = null;
		document.onmouseup   = null;
		Drag.obj.root.onDragEnd(	parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]),
									parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
		// look for a _ondragend attribute
		var dragendfunc=Drag.obj.getAttribute('data-ondragend');
		if(undefined == dragendfunc){dragendfunc=Drag.obj.getAttribute('_ondragend');}
		if(undefined != dragendfunc){
        	var dropdiv=new Object();
            for(var a=0;a<Drag.obj.attributes.length;a++){
				var attrib=Drag.obj.attributes[a];
				dropdiv[attrib.name]=attrib.value;
            }
            //get the new position of the object that was dragged
            dropdiv.drag_x=parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]);
            dropdiv.drag_y=parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]);
            //showProperties(dropdiv);
			window[dragendfunc](dropdiv);
		}
		//Am I over any object with an ondrop attribute?  _ondrop="functionName", this function get get the attributes of targetdiv and dropdiv
		var navEls = GetElementsByAttribute('*', '_ondrop', '.+');
		for (var n=0; n<navEls.length; n++){
			if(isOver(Drag.obj,navEls[n])){
				var dropfunc=navEls[n].getAttribute('_ondrop');
				//gather attributes of both elements
				var targetdiv=new Object();
				for(var a=0;a<navEls[n].attributes.length;a++){
					var attrib=navEls[n].attributes[a];
					targetdiv[attrib.name]=attrib.value;
                	}
                var dropdiv=new Object();
                for(var a=0;a<Drag.obj.root.attributes.length;a++){
					var attrib=Drag.obj.root.attributes[a];
					dropdiv[attrib.name]=attrib.value;
                	}
                dropdiv.startX=Drag.obj.startX;
                dropdiv.startY=Drag.obj.startY;
				window[dropfunc](targetdiv,dropdiv);
            	}
        	}
		Drag.obj = null;
	},

	fixE : function(e)
	{
		if (typeof e == 'undefined') e = window.event;
		if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
		if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
		return e;
	}
}
/* initDrop */
function initDrop(tagname,tagatt,attval){
	//make w_dropdown fields hide display on mouse out
	if(undefined == tagname){tagname='div';}
	if(undefined == tagatt){tagatt='data-behavior';}
	if(undefined == attval){attval='dropdown';}
	var navEls = GetElementsByAttribute(tagname,tagatt,attval);
	//alert(navEls.length+" "+tagname+" "+tagatt+" "+attval);
	for (var n=0; n<navEls.length; n++) {
		addEventHandler(navEls[n],'mouseout',function(e) {
			if(undefined == e){e = fixE(e);}
			if(undefined != e){
				if(checkMouseLeave(this,e)){
					this.style.display='none';
					/*Check for onhide attribute*/
					var onhide=this.getAttribute('onhide');
					//window.status="onhide="+onhide;
					if(onhide){
						let jsfunc=new Function(onhide);
    					jsfunc();
    				}
				}
			}
		});
	}
}
/*_marker functions */
function wasqlMarkerForm(){
	var centerpop=getObject('centerpop');
	if(undefined != centerpop){return;}
    ajaxGet('/php/index.php','centerpop',{_template:4,mousex:MouseX,mousey:MouseY,_marker:'click'});
}
var wasqlmarkers={};
var wasqlmarker={};
function wasqlMarkerTagsJson(id){
	var jsondata=getText(id);
	wasqlmarkers=parseJSONString(jsondata);
	for(var i in wasqlmarkers){
		wasqlMarkerTag(wasqlmarkers[i].x,wasqlmarkers[i].y,wasqlmarkers[i].page,wasqlmarkers[i].priority);
	}
}
function wasqlMarkerTag(x,y,page,priority){
	var _markernulldiv=getObject('_markernulldiv');
	if(undefined == _markernulldiv){return 'no _markernulldiv div';}
	var guid='_marker_'+x+'_'+y+'_'+page;
	var hex='#337ab7';
    switch(priority){
		case 0:hex='#bc1717';break;
		case 1:hex='#cf312c';break;
		case 2:hex='#337ab7';break;
		case 3:hex='#bcbcbc';break;
	}
	var icon=page==0?'icon-tags':'icon-tag';
	var txt='<span class="'+icon+' w_pointer" style="font-size:2rem;color:'+hex+';"></span>';
	//console.log(txt);
	var tag=getObject(guid);
	if(undefined != tag){
		setText(tag,txt);
		return guid;
	}
	tag=document.createElement('div');
	tag.id=guid;
	tag.style.position='absolute';
	tag.style.display='inline';
	tag.style.zIndex=600;
    tag.style.top=y+'px';
    tag.style.left=x+'px';

    setText(tag,txt);
    document.body.appendChild(tag);
	return new Array(x,y,page,priority,guid,hex,txt);
}
function wasqlMarkerLoad(){
	var _markernulldiv=getObject('_markernulldiv');
	if(undefined == _markernulldiv){
	    //create a hidden div for the form to be posted to
	    var div_outer = document.createElement('div');
	    div_outer.style.display='none';
	    document.body.appendChild(div_outer);
	    var div_inner = document.createElement('div');
	    div_inner.id='_markernulldiv';
	    div_outer.appendChild(div_inner);
	    ajaxGet('/php/index.php','_markernulldiv',{_template:4,_marker:'load'});
	}
}
/**
 * initialize wasql markers
 * @param element mixed - object or id of the element to enable wasql markers on - defauts to document.body
 * @param icon string - classname from wasql_icons to use as the cursor - defaults to icon-tags
 * @usage wasqlMarkerInit(document.body,'icon-tags');
 */
function wasqlMarkerInit(el,cl){
	if(undefined == el){el=document.body;}
	if(undefined == cl){cl='icon-tags';}
	el=getObject(el);
	/* wasql markers - used to markeup a page for design purposes */
	wasqlMarkerLoad();
	//navEls[n].style.cursor='help';
	fontIconCursor(el,cl);
	addEventHandler(el,'click',function(e){
		//cancel parent onclicks so that the click stops here
		cancelBubble(e);
		//if the left button is clicked then
		if(e.altKey && e.ctrlKey){wasqlMarkerForm();return false;}
		return false;
	});
}
function resizeSignatureWidthHeight(){
	var list=document.querySelectorAll('.w_signature');
	for(var i=0;i<list.length;i++){
		list[i].style.width='100%';
	}
}
/*
 * add event handler to resize any signature canvas
 * */
 //console.log('adding resize');
addEventHandler(window,'resize',function(){resizeSignatureWidthHeight();});
