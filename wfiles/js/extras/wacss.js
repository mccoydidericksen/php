var wacss = {
	version: '2022.0501',
	author: 'WaSQL.com',
	chartjs:{},
	addClass: function(element, classToAdd) {
		element=wacss.getObject(element);
		if(undefined == element){return false;}
		if(undefined==element.className){
			element.className=classToAdd;
			return true;
		}
	    let currentClassValue = element.className;

	    if (currentClassValue.indexOf(classToAdd) == -1) {
	        if ((currentClassValue == null) || (currentClassValue === "")) {
	            element.className = classToAdd;
	        } else {
	            element.className += " " + classToAdd;
	        }
	    }
	},
	blink: function(el){
		el=wacss.getObject(el);
		if(undefined == el){return;}
		let blink=0;
		if(undefined == el.getAttribute('data-blink')){
			el.setAttribute('data-blink',1);
			el.setAttribute('data-boxshadow',el.style.boxShadow);
		}
		else{
			blink=parseInt(el.getAttribute('data-blink'),10);
		}
		let n=blink+1;
		el.setAttribute('data-blink',n);
		switch(blink){
			case 0:
			case 2:
			case 4:
				el.style.boxShadow='0 8px 12px 0 rgba(0,0,0,0.7),0 10px 24px 0 rgba(0,0,0,0.69)';
				setTimeout(function(){wacss.blink(el);},150);
			break;
			case 1:
			case 3:
			case 5:
				el.style.boxShadow='0 8px 12px 0 rgba(0,0,0,0.2),0 10px 24px 0 rgba(0,0,0,0.19)';
				setTimeout(function(){wacss.blink(el);},150);
			break;
			default:
				el.style.boxShadow=el.getAttribute('data-boxshadow');
				el.setAttribute('data-blink',0);
				//wacss.removeClass(el,'tooltip');
				//wacss.removeClass(el,'top');
			break;
		}
	},
	copy2Clipboard: function(str,msg){
		if(undefined==msg){msg='Copy Successful';}
		const el = document.createElement('textarea');
	  	el.value = str;
	  	document.body.appendChild(el);
	  	el.select();
	  	document.execCommand('copy');
	 	document.body.removeChild(el);
	 	wacss.toast(msg);
	 	return true;
	},
	color: function(){
		if(undefined != document.getElementById('admin_menu')){
				return document.getElementById('admin_menu').getAttribute('data-color');
			}
			else if(undefined != document.getElementById('admin_color')){
				return document.getElementById('admin_color').innerText;
			}
			else if(undefined != document.getElementById('wacss_color')){
				return document.getElementById('wacss_color').innerText;
			}
			else{return 'w_gray';}
	},
	dismiss: function(el){
		/* if the user is hovering over it, do not close.*/
		if(el.parentElement.querySelector(':hover') == el){
			let wtimer=parseInt(el.timer)*3;
			setTimeout(function(){
				wacss.dismiss(el);
				},wtimer
			);
			return;
		}
		el.className='toast dismiss';
		setTimeout(function(){
			wacss.removeObj(el);
		},1000);
	},
	emulateEvent: function(el,ev){
		el=wacss.getObject(el);
		if(undefined == el){return false;}
		if ("createEvent" in document) {
		    let evt = document.createEvent("HTMLEvents");
		    evt.initEvent(ev, false, true);
		    el.dispatchEvent(evt);
		}
		else{
		    el.fireEvent("on"+ev);
		}
		return false;
	},
	function_exists: function(function_name){   
    	if (typeof function_name == 'string'){  
        	return (typeof window[function_name] == 'function');  
    	} else{  
        	return (function_name instanceof Function);  
    	}
	},
	getAllAttributes: function(obj){
		//info: get all attributes of a specific object or id
		let node=wacss.getObject(obj);
		let rv = {};
	    for(let i=0; i<node.attributes.length; i++){
	        if(node.attributes.item(i).specified){
	            rv[node.attributes.item(i).nodeName]=node.attributes.item(i).nodeValue;
				}
			}
	    return rv;
	},
	geoLocation: function(fld,opts){
		//fld can be a function: (lat,long) or an input field to set value to: [lat,long] 
		fldObj=wacss.getObject(fld);
		if(undefined==fldObj){
			if(!wacss.function_exists(fld)){
				console.log("wacss.getGeoLocation error: "+fld+' is undefined');
				return false;
			}
		}
  		if(navigator.geolocation) {
    		let options = {
      			enableHighAccuracy: true,
      			timeout: 10000,
      			maximumAge: 5000
    		};
    		//allow options to be set
    		if(undefined != opts){
    			for(let k in opts){
    				if(k == 'onerror'){
    					navigator.geoSetFldFailed=opts[k];
    				}
    				else{
    					options[k]=opts[k];
    				}
    			}
    		}
    		navigator.geoSetFld=fld;
    		navigator.geoOptions=options;
    		navigator.geolocation.getCurrentPosition(
    			function(position){
    				//console.log(navigator.geoSetFld);
    				//console.log(wacss.function_exists(navigator.geoSetFld));
    				if (wacss.function_exists(navigator.geoSetFld)){
    					window[navigator.geoSetFld](position.coords.latitude,position.coords.longitude,navigator.geoOptions);
    				}
    				else{
    					//check for showmap option
    					if(undefined!=navigator.geoOptions.showmap && navigator.geoOptions.showmap==1){
    							navigator.geoOptions.input=navigator.geoSetFld;
    							wacss.geoLocationMap(position.coords.latitude,position.coords.longitude,navigator.geoOptions);
    					}
    					else{
    						fldObj=getObject(navigator.geoSetFld);
    						fldObj.value='['+position.coords.latitude+','+position.coords.longitude+']';	
    					}
    				}
    				
    				return false; 
    			},
    			function(err){
    				//err returns err.code and err.message
    				//err.code: 1=permission denied, 2=position unavailable, 3=timeout
    				navigator.geoOptions.code=err.code;
    						navigator.geoOptions.message=err.message;
    				if(undefined != navigator.geoSetFldFailed){
    					if (wacss.function_exists(navigator.geoSetFldFailed)){
	    					window[navigator.geoSetFldFailed](navigator.geoOptions);
	    				}
	    				else{
	    					if(undefined==navigator.geoOptions.showmap && navigator.geoOptions.showmap==1){
	    						alert(err.message);
	    					}
	    					else{
		    					let errfld=document.querySelector(navigator.geoSetFldFailed);
		    					if(undefined != errfld){
		    						setText(wacss.getObject(errfld),err.message);
		    					}
		    					else{
		    						console.log('wacss.getGeoLocation error. Invalid onerror value');
		    						console.log(navigator.geoSetFldFailed);
		    						console.log(err.message);
		    					}
		    				}
	    				}
    				}
    				else{
    					if(undefined==navigator.geoOptions.showmap && navigator.geoOptions.showmap==1){
    						alert(err.message);
    					}
    					else{
    						console.log('wacss.getGeoLocation error. No onerror set.');
    						console.log(navigator.geoOptions);
    					}
    				}
    				return false;
    			},
    			options
    		);
  		} 
		return false;
	},
	geoLocationMap: function(lat,long,params){
		//console.log('geoLocationMap');
		lat=parseFloat(lat);
		long=parseFloat(long);
		//console.log(lat);
		//console.log(long);
		//console.log(params);
		if(undefined == params){params={};}
		if(undefined == params.displayname){params.displayname='Click on map to select';}
		params.lat=lat;
		params.long=long;
		if(undefined != document.getElementById('geolocationmap_content')){
			params.div='geolocationmap_content';
			wacss.geoLocationMapContent(params);
			centerObject('geolocationmap');
			return 1;
		}
		let popup=document.createElement('div');
		popup.id='geolocationmap_popup';
		popup.style='z-index:99999999;background:#FFF;width:80vw;height:80vh;position:absolute;display:flex;flex-direction:column;justify-content:flex-start;border-radius:5px;box-shadow: 0 4px 8px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%);';
		let popup_title=document.createElement('div');
		popup_title.style="display:flex;justify-content:center;align-items:center;width:100%;";
		popup_title.id='geolocationmap_title';
		let popup_title_img=document.createElement('img');
		popup_title_img.src='/wfiles/svg/google-maps.svg';
		popup_title_img.style='height:32px;width:auto;';
		popup_title.appendChild(popup_title_img);
		let popup_title_text=document.createElement('div');
		popup_title_text.style='padding-top:5px;flex:1;height:100%;line-height:1.2rem;color:#FFF;background:#b5b5b5;font-size:1.2rem;text-align:center;';
		popup_title_text.innerHTML=params.displayname;
		popup_title.appendChild(popup_title_text);
		let popup_title_close=document.createElement('span');
		popup_title_close.className='icon-close w_red';
		popup_title_close.style='background:#b5b5b5;padding-right:10px;height:100%;padding-top:5px;cursor:pointer;';
		popup_title_close.onclick=function(){
			removeId('geolocationmap_popup');
		}
		popup_title.appendChild(popup_title_close);
		popup.appendChild(popup_title);
		let popup_content=document.createElement('div');
		popup_content.id='geolocationmap_content';
		popup_content.style='flex:1;';
		popup.appendChild(popup_content);
		params.div=popup_content;
		wacss.geoLocationMapContent(params);
		document.body.appendChild(popup);
		centerObject(popup);
	},
	geoLocationMapContent:function(params){
		//console.log('geoLocationMapContent');
		//console.log(params);
		if(undefined == params){params={};}
		params.zoom=params.zoom||13;
		//return;
		let myLatlng={ lat: params.lat, lng: params.long };
		let map_params={
			center: myLatlng,
			streetViewControl: false,
			mapTypeId: 'roadmap',
			zoom: params.zoom,

			styles: []
		};
		if(undefined != params['hide'] && params['hide'].toLowerCase().indexOf('poi') != -1){
			let poi={ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }]};
			map_params.styles.push(poi);
		}
		
		let map = new google.maps.Map(params.div, map_params);
		map.addListener('click', function (event) {
			// If the event is a POI
		  	if (event.placeId) {
				// Call event.stop() on the event to prevent the default info window from showing.
		    	event.stop();
		  	}
		});
		//add markers
		/* markers MUST have position - json latlong - {lat:, lng:} */
		/* markers CAN have title - hello world */
		/* markers CAN have label - B or 2 -- single letter or number */
		/* markers CAN have icon - https://some_url_to_png */
		if(undefined != params['markers']){
			if(!Array.isArray(params['markers'])){
				params['markers']=new Array(params['markers']);
			}
			for(let m=0;m<params['markers'].length;m++){
				let marker=params['markers'][m];
				marker.map=map;
				let mark=new google.maps.Marker(marker);
			}
		}
		// Create the initial InfoWindow.
		if(undefined == params.hideinfo){
			let infoWindow = new google.maps.InfoWindow({
			  content: params.displayname,
			  position: myLatlng,
			});
			infoWindow.open(map);
			let mylatlonval='['+myLatlng.lat+','+myLatlng.lng+']';
			let htm='';
			htm='<div class="align-center w_smallest w_gray">'+mylatlonval+'</div><div class="align-center w_padtop"><span class="icon-map-marker w_red"></span> Location</div>';
			infoWindow.setContent(htm);
			if(undefined == params.readonly){			
				map.params=params;
				// Configure the click listener.
				map.addListener("click", (mapsMouseEvent) => {
					//console.log(map.params.input);
					let latlon=mapsMouseEvent.latLng.toJSON();
					let latlonval='['+latlon.lat+','+latlon.lng+']';
				  	// Close the current InfoWindow.
				  	infoWindow.close();
				  	// Create a new InfoWindow.
				  	infoWindow = new google.maps.InfoWindow({
				    	position: mapsMouseEvent.latLng,
				  	});
				  	let chtm='<div class="align-center w_smallest w_gray">'+latlonval+'</div><div class="align-center w_padtop"><span class="icon-map-marker w_red"></span> <span data-lat="'+latlon.lat+'" data-lon="'+latlon.lng+'" data-latlon="'+latlonval+'" data-input="'+map.params.input+'" class="w_pointer" onclick="return wacss.geoLocationMapSetValue(this);"><span class="w_bigger w_gray icon-save w_pointer"></span> Save</span></div>';
				  	infoWindow.setContent(chtm);
				  	infoWindow.open(map);
				});
			}
		}
	},
	geoLocationMapSetValue: function(el){
		let inp=wacss.getObject(el.dataset.input);
		inp.value=el.dataset.latlon;
		let clickdiv=wacss.getObject(el.dataset.input+'_clickdiv');
		if(undefined != clickdiv){
			clickdiv.dataset.lat=el.dataset.lat;
			clickdiv.dataset.lon=el.dataset.lon;
		}
		removeId('geolocationmap_popup');
		return false;
	},
	getObject: function(obj){
		//info: returns the object identified by the object or id passed in
		if(typeof(obj)=='object'){return obj;}
	    else if(typeof(obj)=='string'){
	    	//try querySelector
	    	let qso=document.querySelector('#'+obj);
	    	if(typeof(qso)=='object'){return qso;}
	    	qso=document.querySelector(obj);
	    	if(typeof(qso)=='object'){return qso;}
	    	//try getElementById
			if(undefined != document.getElementById(obj)){return document.getElementById(obj);}
			else if(undefined != document.getElementsByName(obj)){
				let els=document.getElementsByName(obj);
				if(els.length ==1){return els[0];}
	        	}
			else if(undefined != document.all[obj]){return document.all[obj];}
	    }
	    return null;
	},
	getParent: function(obj,name,classname){
		if(undefined == obj){return null;}
		if(undefined == classname){classname='';}
		if(undefined != name){
			let count = 1;
			while(count < 1000) {
				if(undefined == obj.parentNode){return null;}
				obj = obj.parentNode;
				if(!typeof(obj)){return null;}
				if(obj.nodeName.toLowerCase() == name.toLowerCase()){
					//filters
					if(classname.length){
						if(obj.classList.contains(classname)){
							return obj;
						}
					}
					else{
						return obj;
					}
				}
				count++;
			}
			return null;	
		}
		let cObj=wacss.getObject(obj);
		if(undefined == cObj){return abort("undefined object passed to getParent");}
		if(undefined == cObj.parentNode){return cObj;}
		let pobj=cObj.parentNode;
		if(typeof(cObj.parentNode) == "object"){return cObj.parentNode;}
		else{return wacss.getParent(pobj);}
	},
	getSiblings: function (elem) {
		// Setup siblings array and get the first sibling
		let siblings = [];
		let sibling = elem.parentNode.firstChild;

		// Loop through each sibling and push to the array
		while (sibling) {
			if (sibling.nodeType === 1 && sibling !== elem) {
				siblings.push(sibling);
			}
			sibling = sibling.nextSibling
		}

		return siblings;

	},
	guid: function () {
	    function _p8(s) {
	        let p = (Math.random().toString(16)+"000000000").substr(2,8);
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	    }
	    return _p8() + _p8(true) + _p8(true) + _p8();
	},
	in_array: function(needle, haystack) {
	    let length = haystack.length;
	    for(let i = 0; i < length; i++) {
	    	//console.log('in_array',haystack[i],needle);
	        if(haystack[i] == needle){return true;}
	    }
	    return false;
	},
	init: function(){
		/*wacssedit*/
		wacss.initWacssEdit();
		wacss.initChartJs();
		wacss.initCodeMirror();
		wacss.initEditor();
	},
	chartjsDrawTotals: function(chart){
		let width = chart.chart.width,
	    height = chart.chart.height,
	    ctx = chart.chart.ctx;
	 
	    ctx.restore();
	    let fontSize = (height / 60).toFixed(2);
	    ctx.font = fontSize + "em sans-serif";
	    ctx.textBaseline = "middle";
	 
	    let text = chart.config.centerText.text,
	    textX = Math.round((width - ctx.measureText(text).width) / 2),
	    textY = height-20;
	 
	    ctx.fillText(text, textX, textY);
	    ctx.save();
	},
	initChartJsBehavior: function(chartid){
		let list=document.querySelectorAll('[data-behavior="chartjs"]');
		if(undefined != chartid){
			list=document.querySelectorAll('#'+chartid);
		}
		if(list.length==0){return;}
		let gcolors = new Array(
	        'rgb(255, 159, 64)',
	        'rgb(75, 192, 192)',
	        'rgb(255, 99, 132)',
	        'rgb(54, 162, 235)',
	        'rgb(153, 102, 255)',
	        'rgb((218,165,32)',
	        'rgb(233,150,122)',
	        'rgb(189,183,107)',
	        'rgb(154,205,50)',
	        'rgb(255,228,196)',
	        'rgb(244,164,96)',
	        'rgb(176,196,222)',
	        'rgb(188,143,143)',
	        'rgb(255,228,225)',
	        'rgb(201, 203, 207)'
	    );
		for(let i=0;i<list.length;i++){
			if(undefined==list[i].id){
				console.log('Error in initChartJsBehavior: missing id attribute');
				console.log(list[i]);
				continue;
			}
			if(undefined==list[i].dataset.type){
				console.log('Error in initChartJsBehavior: missing data-type attribute');
				console.log(list[i]);
				continue;
			}
			if(undefined==chartid && undefined!=list[i].dataset.initialized){continue;}
			list[i].dataset.initialized=1;
			let datadiv=document.querySelector('#'+list[i].id+'_data');
			if(undefined==datadiv){
				console.log('Error in initChartJsBehavior: missing data div attribute');
				console.log(list[i]);
				continue;
			}
			//setup the config: type, data, options
			let lconfig = {
				type:list[i].dataset.type,
				data:{
					labels:[],
					datasets:[]
				},
				options:{
					responsive: true,
            		events: false,
            		animation: {animateScale:false,animateRotate:true},
            		title:{display:false},
            		tooltips: {enabled:false,intersect: false,mode:'index'},
            		plugins:{
            			labels:{
            				fontColor:function (data) {
								let rgb = {};
								rgb=wacss.hexToRgb(data.dataset.backgroundColor[data.index]);
								if(undefined == rgb.r){return '#FFF';}
								let threshold = 140;
								let luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
								return luminance > threshold ? 'black' : 'white';
								},
							precision:0,
							showActualPercentages:true
            			}
            		}
				}
			};
			//labels
			let labelsdiv=datadiv.querySelector('labels');
			if(undefined != labelsdiv){
				let labelsjson=wacss.trim(labelsdiv.innerText);
				lconfig.data.labels=JSON.parse(labelsjson);
			}
			//colors
			let colorsdiv=datadiv.querySelector('colors');
			if(undefined != colorsdiv){
				let colorsjson=wacss.trim(colorsdiv.innerText);
				colors=JSON.parse(colorsjson);
			}
			else{
				colors=gcolors;
			}
			//datasets
			let datasets=datadiv.querySelectorAll('dataset');
			for(let d=0;d<datasets.length;d++){
				let json=JSON.parse(datasets[d].innerText);   		
				let dataset={
					label:datasets[d].dataset.label || datasets[d].dataset.title || '',
					backgroundColor: datasets[d].dataset.backgroundcolor || colors,
                    type:datasets[d].dataset.type || lconfig.type,
					data: json
				};
				//fill
				if(undefined != datasets[d].dataset.fill && datasets[d].dataset.fill.toLowerCase()=='false'){
					dataset.fill=false;
				}
				else if(undefined != list[i].dataset.fill && list[i].dataset.fill.toLowerCase()=='false'){
					dataset.fill=false;
				}
				lconfig.data.datasets.push(dataset);
			}
			//options - responsive
			if(undefined != list[i].dataset.responsive && list[i].dataset.responsive.toLowerCase()=='false'){
				lconfig.options.responsive=false;
			}
			//options - title
			if(undefined != list[i].dataset.title){
				lconfig.options.title={display:true,text:list[i].dataset.title};
			}
			//options - scales - x,y - stacked
			if(undefined != list[i].dataset.stacked && list[i].dataset.stacked.toLowerCase()=='true'){
				lconfig.options.scales={
					xAxes:[{stacked:true}],
					yAxes:[{stacked:true}]
				};
			}
			//options - plugins - legend - display
			if(undefined != list[i].dataset.legenddisplay && list[i].dataset.legenddisplay.toLowerCase()=='false'){
				lconfig.options.legend={display:false};
			}
			//options - plugins - labels - render
			if(undefined != list[i].dataset.render){
				lconfig.options.plugins.labels.render=list[i].dataset.render;
			}
			//options - plugins - labels - fontColor
			if(undefined != list[i].dataset.fontcolor){
				lconfig.options.plugins.labels.fontColor=list[i].dataset.fontcolor;
			}
			//options - plugins - labels - precision
			if(undefined != list[i].dataset.precision){
				lconfig.options.plugins.labels.precision=list[i].dataset.precision;
			}
			//options - plugins - labels - position
			if(undefined != list[i].dataset.position){
				lconfig.options.plugins.labels.position=list[i].dataset.position;
			}
			//options - plugins - labels - outsidePadding
			if(undefined != list[i].dataset.outsidepadding){
				lconfig.options.plugins.labels.outsidePadding=list[i].dataset.outsidepadding;
			}
			//options - plugins - labels - textMargin
			if(undefined != list[i].dataset.textmargin){
				lconfig.options.plugins.labels.textMargin=list[i].dataset.textmargin;
			}
			//options - plugins - labels - textMargin
			if(undefined != list[i].dataset.centertext){
				lconfig.options.plugins.doughnutlabel={
					color:list[i].dataset.centertextcolor || '#000',
					labels:[{
						text: list[i].dataset.centertext,
						font:{size:list[i].dataset.centertextfontsize || 30}
					}]
				};
			}
			let lcanvas=document.createElement('canvas');
			list[i].appendChild(lcanvas);
			let lctx = lcanvas.getContext('2d');
			wacss.chartjs[list[i].id] = new Chart(lctx, lconfig);
			//onclick
			if(undefined != list[i].dataset.onclick){
				lcanvas.parentobj=list[i];
				lcanvas.chartobj=wacss.chartjs[list[i].id];
				lcanvas.onclick_func=list[i].dataset.onclick;
				lcanvas.clicked=0;
				lcanvas.onclick = function(evt){
					if(this.clicked==0){
						this.clicked=1;
				        //set clicked back to 0 in 250 ms (this prevents duplicate click events)
				        this.timeout=setTimeout(function(obj){obj.clicked=0;}, 250,this);
						let activePoints = this.chartobj.getElementsAtEventForMode(evt, 'point', this.chartobj.options);
				        if(activePoints.length > 0){
					        let firstPoint = activePoints[0];
					        let params={};
					        params.parent=this.parentobj;
					        params.chart=this.chartobj;
					        params.type=this.parentobj.getAttribute('data-type');
					        params.label = this.chartobj.data.labels[firstPoint._index] || this.chartobj.data.datasets[firstPoint._datasetIndex].label;
					        params.value = this.chartobj.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
					        window[this.onclick_func](params);
					    }
				    }
				};
			}
		}
	},
	initChartJs: function(initid){
		wacss.initChartJsBehavior();
		let list=document.querySelectorAll('div.chartjs');
		let gcolors = new Array(
	        'rgb(255, 159, 64)',
	        'rgb(75, 192, 192)',
	        'rgb(255, 99, 132)',
	        'rgb(54, 162, 235)',
	        'rgb(153, 102, 255)',
	        'rgb((218,165,32)',
	        'rgb(233,150,122)',
	        'rgb(189,183,107)',
	        'rgb(154,205,50)',
	        'rgb(255,228,196)',
	        'rgb(244,164,96)',
	        'rgb(176,196,222)',
	        'rgb(188,143,143)',
	        'rgb(255,228,225)',
	        'rgb(201, 203, 207)'
	    );
		//console.log(list);
		for(let i=0;i<list.length;i++){
			if(undefined == list[i].id){
				console.log('missing id',list[i]);
				continue;
			}
			if(undefined != initid && list[i].id != initid){
				continue;
			}
			if(undefined == list[i].getAttribute('data-type')){
				console.log('missing data-type',list[i]);
				continue;
			}
			//check for data element
			//console.log('initChartJs: '+list[i].id);
			if(undefined == document.getElementById(list[i].id+'_data')){
				console.log('missing data div',list[i]);
				continue;
			}
			list[i].setAttribute('data-initialized',1);
			let type=list[i].dataset.type.toLowerCase();
			let datadiv=wacss.getObject(list[i].id+'_data');
			//colors
			let colorsdiv=datadiv.querySelector('colors');
			if(undefined != colorsdiv){
				let colorsjson=wacss.trim(colorsdiv.innerText);
				colors=JSON.parse(colorsjson);
			}
			else{
				colors=gcolors;
			}
			//labels
			let labels=new Array();
			let labelsdiv=datadiv.querySelector('labels');
			if(undefined != labelsdiv){
				let labelsjson=wacss.trim(labelsdiv.innerText);
				//lconfig.data.labels=JSON.parse(labelsjson);
				labels=JSON.parse(labelsjson);
			}
			//options
			let optionsdiv=datadiv.querySelector('options');
			if(undefined != optionsdiv){
				let optionsjson=wacss.trim(optionsdiv.innerText);
				//lconfig.options=JSON.parse(optionsjson);
				options=JSON.parse(optionsjson);
			}
			else{
				options={
					responsive:true
				};
			}
			let foundchart=0;
			switch(type){
				case 'guage':
					if(undefined != wacss.chartjs[list[i].id]){
						//check for canvas
						let ck=list[i].querySelector('canvas');
						if(undefined != ck){
							//update existing chart
							let gv=list[i].dataset.value || datadiv.innerText;
							gv=parseInt(gv);
							let max=list[i].dataset.max||180;
							let gv1=parseInt(max*(gv/100));
							if(gv1 > max){gv1=max;}
							let gv2=max-gv1;
							wacss.chartjs[list[i].id].config.centerText.text=gv1;
							wacss.chartjs[list[i].id].config.data.datasets[0].data=[gv1,gv2];
	        				wacss.chartjs[list[i].id].update();
	        				foundchart=1;
		        		}
					}
					if(foundchart==0){
						let gv=list[i].dataset.value || datadiv.innerText;
						gv=parseInt(gv);
						let max=list[i].dataset.max||180;
						let gv1=parseInt(max*(gv/100));
						if(gv1 > max){gv1=max;}
						let gv2=max-gv1;
						let color=list[i].dataset.color || '#009300';
	        			
						//console.log(type);
						let gconfig = {
							type:'doughnut',
							data: {
								datasets: [{
									data: [gv1,gv2],
	                        		backgroundColor: colors,
	                        		borderWidth: 0
	                    		}]
	            			},
	            			options: {
	            				title:{display:false},
	                			circumference: Math.PI,
	                			rotation: -1 * Math.PI,
	                			responsive: true,
	                			plugins:{
	                				labels: {
										render: list[i].dataset.render || 'label', //label,percentage,value
										fontColor: list[i].dataset.fontcolor || function (data) {
											let rgb = {};
											rgb=wacss.hexToRgb(data.dataset.backgroundColor[data.index]);
											if(undefined == rgb.r){
												return 'white';
											}
											let threshold = 140;
											let luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
											return luminance > threshold ? 'black' : 'white';
											},
										precision: list[i].dataset.precision || 2,
										position: list[i].dataset.position || 'outside',
										outsidePadding: list[i].dataset.outsidepadding || 4,
										textMargin: list[i].dataset.textmargin || 4
									}
	                			},
	                			legend:{display:false},
	                    		animation: {animateScale:false,animateRotate:true}
	            			},
	            			centerText:{
	            				display:true,
	            				text: gv1
	            			}
	        			};
	        			if(undefined != list[i].dataset.labels && list[i].dataset.labels=='false'){
	        				gconfig.options.plugins.datalabels.display=false;
	        			}
	        			if(undefined != list[i].dataset.title){
	        				gconfig.options.title={display:true,padding:0,position:'bottom',text:list[i].dataset.title};
	        			}
	        			if(undefined != list[i].dataset.titlePosition){
	        				gconfig.options.title.position=list[i].dataset.titlePosition;
	        			}
	        			let gcanvas=document.createElement('canvas');
	        			list[i].appendChild(gcanvas);
	        			let gctx = gcanvas.getContext('2d');
						wacss.chartjs[list[i].id]  = new Chart(gctx, gconfig);
						Chart.pluginService.register({
						    afterDraw: function(chart) {
						    	if(undefined != chart.config.centerText){
						        	if ( undefined != chart.config.centerText.display){
						        		//console.log(chart);
						        		wacss.chartjsDrawTotals(chart);	
						        	} 
						        }
						    }
						});
						

						/* check for data-onclick */
						if(undefined != list[i].getAttribute('data-onclick')){
							gcanvas.parentobj=list[i];
							gcanvas.chartobj=wacss.chartjs[list[i].id];
							gcanvas.onclick_func=list[i].getAttribute('data-onclick');
							gcanvas.clicked=0;
							gcanvas.onclick = function(evt){
								if(this.clicked==0){
									this.clicked=1;
							        //set clicked back to 0 in 250 ms (this prevents duplicate click events)
							        this.timeout=setTimeout(function(obj){obj.clicked=0;}, 250,this);
									let activePoints = this.chartobj.getElementsAtEventForMode(evt, 'point', this.chartobj.options);
							       	if(activePoints.length > 0){
								        let firstPoint = activePoints[0];
								        let params={};
								        params.parent=this.parentobj;
								        params.chart=this.chartobj;
								        params.type=this.parentobj.getAttribute('data-type');
								        params.label = this.chartobj.data.labels[firstPoint._index] || this.chartobj.data.datasets[firstPoint._datasetIndex].label;
								        params.value = this.chartobj.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
								        window[this.onclick_func](params);
								    }
							    }
							};
						}
					}
				break;
				case 'line':
				case 'bar':
				case 'horizontalbar':
				case 'doughnut':
					//console.log('barline');
					if(undefined != wacss.chartjs[list[i].id]){
						//check for canvas
						let ck=list[i].querySelector('canvas');
						if(undefined != ck){	
							if(undefined != labels && labels.length > 0){
								wacss.chartjs[list[i].id].config.data.labels=labels;
							}
							let udatasets=datadiv.querySelectorAll('dataset');
							let datasetLabels=new Array();
		        			for(let ud=0;ud<udatasets.length;ud++){
		        				//require data-label
		        				let json=JSON.parse(udatasets[ud].innerText);  			
								let udataset={
									backgroundColor: udatasets[ud].getAttribute('data-backgroundColor') || colors[ud],
		                            type:udatasets[ud].getAttribute('data-type') || list[i].getAttribute('data-type'),
									data: json,
									fill:false,
									pointBackgroundColor:[],
									pointBorderColor: []
								};
								if(undefined != udatasets[ud].getAttribute('data-showLine') && udatasets[ud].getAttribute('data-showLine')=='false'){
									udataset.showLine=false;
								}
								if(undefined != udatasets[ud].getAttribute('data-yaxis')){
									udataset.yAxisID=udatasets[ud].getAttribute('data-yaxis');
								}
								if(undefined != udatasets[ud].getAttribute('data-label')){
									udataset.label=udatasets[ud].getAttribute('data-label');
									let dlabel=udatasets[ud].getAttribute('data-label');
		        					datasetLabels.push(dlabel); 
								}
								//check for fillColor in dataset itself
								for(let ds=0;ds<udataset.data.length;ds++){
									if(undefined != udataset.data[ds].pointBackgroundColor){
										udataset.pointBackgroundColor[ds]=udataset.data[ds].pointBackgroundColor;
									}
									if(undefined != udataset.data[ds].pointBorderColor){
										udataset.pointBorderColor[ds]=udataset.data[ds].pointBorderColor;
									}
									if(undefined != udataset.data[ds].backgroundColor){
										udataset.backgroundColor[ds]=udataset.data[ds].backgroundColor;
									}
									if(undefined != udataset.data[ds].borderColor){
										udataset.borderColor[ds]=udataset.data[ds].borderColor;
									}
								}
								wacss.chartjs[list[i].id].config.data.datasets[ud] = udataset;
		        			}
		        			wacss.chartjs[list[i].id].config.options=options;
		        			if((undefined == labels || labels.length==0) && undefined != datasetLabels && datasetLabels.length > 0){
								wacss.chartjs[list[i].id].config.data.labels=datasetLabels;
							}
							if(undefined != list[i].getAttribute('data-stacked') && list[i].getAttribute('data-stacked')==1){
								if(undefined != wacss.chartjs[list[i].id].config.options.scales.yAxes[0]){
									wacss.chartjs[list[i].id].config.options.scales.yAxes[0].stacked=true;
								}
								if(undefined != wacss.chartjs[list[i].id].config.options.scales.xAxes[0]){
									wacss.chartjs[list[i].id].config.options.scales.xAxes[0].stacked=true;
								}
							}
		        			wacss.chartjs[list[i].id].update();
		        			foundchart=1;
		        		}
					}
					if(foundchart==0){
						let lconfig = {
							type:list[i].getAttribute('data-type'),
							data:{
								labels:labels,
								datasets:[]
							},
							options:options
						};
						if(undefined != list[i].getAttribute('data-stacked') && list[i].getAttribute('data-stacked')==1){
							if(undefined != undefined != lconfig.options.scales.yAxes[0]){
								lconfig.options.scales.yAxes[0].stacked=true;	
							}
							if(undefined != undefined != lconfig.options.scales.xAxes[0]){
								lconfig.options.scales.xAxes[0].stacked=true;
							}
						}
	        			//look for datasets;
	        			//console.log(colors);
	        			let datasets=datadiv.querySelectorAll('dataset');
	        			let datasetLabels=new Array();
	        			for(let d=0;d<datasets.length;d++){
	        				//require data-label
	        				let json=JSON.parse(datasets[d].innerText);   
	        				let fill=datasets[d].getAttribute('data-fill') || list[i].getAttribute('data-fill');
							if(undefined != fill){
								if(fill.indexOf('true') != -1){fill=true;}
								else if(fill == '1'){fill=true;}
								else{fill=false;}
							}   
							else{fill=false;}				
							let dataset={
								backgroundColor: datasets[d].getAttribute('data-backgroundColor') || colors[d],
	                            type:datasets[d].getAttribute('data-type') || list[i].getAttribute('data-type'),
								data: json,
								fill:fill,
								pointBackgroundColor:[],
								pointBorderColor: []
							};
							if(undefined != datasets[d].getAttribute('data-yaxis')){
								dataset.yAxisID=datasets[d].getAttribute('data-yaxis');
							}
							if(undefined != datasets[d].getAttribute('data-showLine') && datasets[d].getAttribute('data-showLine')=='false'){
								dataset.showLine=false;
							}
							if(undefined != datasets[d].getAttribute('data-label')){
								dataset.label=datasets[d].getAttribute('data-label');
								let dlabel=datasets[d].getAttribute('data-label');
	        					datasetLabels.push(dlabel); 
							}
							//check for fillColor in dataset itself
							for(let ds=0;ds<dataset.data.length;ds++){
								if(undefined != dataset.data[ds].pointbackgroundcolor){
									dataset.pointBackgroundColor[ds]=dataset.data[ds].pointbackgroundcolor;
								}
								if(undefined != dataset.data[ds].pointbordercolor){
									dataset.pointBorderBolor[ds]=dataset.data[ds].pointbordercolor;
								}
								if(undefined != dataset.data[ds].backgroundcolor){
									dataset.backgroundColor[ds]=dataset.data[ds].backgroundcolor;
								}
								if(undefined != dataset.data[ds].bordercolor){
									dataset.borderColor[ds]=dataset.data[ds].bordercolor;
								}
							}
							lconfig.data.datasets.push(dataset);
	        			}
	        			if((undefined == labels || labels.length==0) && undefined != datasetLabels && datasetLabels.length > 0){
	        				lconfig.data.labels=datasetLabels;	
	        			}
	        			//
	        			let lcanvas=document.createElement('canvas');
	        			list[i].appendChild(lcanvas);
	        			let lctx = lcanvas.getContext('2d');
						wacss.chartjs[list[i].id]  = new Chart(lctx, lconfig);
						/* check for data-onclick */
						if(undefined != list[i].getAttribute('data-onclick')){
							lcanvas.parentobj=list[i];
							lcanvas.chartobj=wacss.chartjs[list[i].id];
							lcanvas.onclick_func=list[i].getAttribute('data-onclick');
							lcanvas.clicked=0;
							lcanvas.onclick = function(evt){
								if(this.clicked==0){
									this.clicked=1;
							        //set clicked back to 0 in 250 ms (this prevents duplicate click events)
							        this.timeout=setTimeout(function(obj){obj.clicked=0;}, 250,this);
							        //get exact element you clicked on
							        let activePoint = this.chartobj.getElementAtEvent(evt);
								    if (activePoint.length > 0) {
								    	let firstPoint = activePoint[0];
								       	let clickedDatasetIndex = firstPoint._datasetIndex;
								       	let clickedElementIndex = firstPoint._index;
								       	let clickedDatasetPoint = this.chartobj.data.datasets[clickedDatasetIndex];
								       	let label = clickedDatasetPoint.label;
								       	let value = clickedDatasetPoint.data[clickedElementIndex]["y"];  
								       	let params={};
								       	params.parent=this.parentobj;
								        params.chart=this.chartobj;
								       	params.type=this.parentobj.getAttribute('data-type');
								       	params.label = this.chartobj.data.labels[firstPoint._index] || clickedDatasetPoint.label;
								       	params.value = clickedDatasetPoint.data[firstPoint._index] || clickedDatasetPoint.data[clickedElementIndex]["y"];
								       	params.axis = clickedDatasetPoint.yAxisID || 'default';
								       	window[this.onclick_func](params);   
								    }
								    else{
										let activePoints = this.chartobj.getElementsAtEventForMode(evt, 'point', this.chartobj.options);
										if(activePoints.length > 0){
									        let firstPoint = activePoints[0];
									        let params={};
									        params.parent=this.parentobj;
								        	params.chart=this.chartobj;
									        params.type=this.parentobj.getAttribute('data-type');
									        params.label = this.chartobj.data.labels[firstPoint._index] || this.chartobj.data.datasets[firstPoint._datasetIndex].label;
									        params.value = this.chartobj.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
									        params.axis = this.chartobj.data.datasets[firstPoint._datasetIndex].yAxisID || 'default';
									        window[this.onclick_func](params);
									    }
									}
							    }
							};
						}
					}
				break;
				case 'pie':
					if(undefined != wacss.chartjs[list[i].id]){
						//check for canvas
						let ck=list[i].querySelector('canvas');
						if(undefined != ck){
							//update existing pie chart
							let pielabels=[];
		        			let data=[];
		        			let datasets=datadiv.querySelectorAll('dataset');
		        			let json=JSON.parse(datasets[0].innerText); 
		        			for(let tval in json){
		        				pielabels.push(tval);
		        				data.push(json[tval]);
		        			}
		        			wacss.chartjs[list[i].id].config.data.datasets[0].data=data;
		        			if(undefined != labels && labels.length > 0){
								wacss.chartjs[list[i].id].config.data.labels=labels;
							}
		        			else{
		        				wacss.chartjs[list[i].id].config.data.labels=pielabels;
		        			}
		        			//console.log(wacss.chartjs[list[i].id].config);
	        				wacss.chartjs[list[i].id].update();
	        				foundchart=1;
		        		}
					}
					if(foundchart==0){
						//look for datasets;
	        			let pielabels=[];
	        			let data=[];
	        			let datasets=datadiv.querySelectorAll('dataset');
	        			let json=JSON.parse(datasets[0].innerText); 
	        			for(let tval in json){
	        				pielabels.push(tval);
	        				data.push(json[tval]);
	        			}
	        			let pconfig={
	        				type: 'pie',
	        				data: {
	        					labels: labels,
	        					datasets:[{
	        						backgroundColor: colors,
	        						fill: true,
	        						data: data
	        					}]
	        				},
	        				options: {
	        					responsive: true,
	                    		events: false,
	                    		animation: {animateScale:false,animateRotate:true},
	        					title:{
	        						display: list[i].dataset.label?true:false,
	        						text: list[i].dataset.label || ''
	        					},
	        					rotation: -0.7 * Math.PI,
	        					plugins: {
	        						labels: {
										render: list[i].dataset.render || 'label', //label,percentage,value
										fontColor: list[i].dataset.fontcolor || function (data) {
											let rgb = {};
											rgb=wacss.hexToRgb(data.dataset.backgroundColor[data.index]);
											if(undefined == rgb.r){
												return 'white';
											}
											let threshold = 140;
											let luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
											return luminance > threshold ? 'black' : 'white';
											},
										precision: list[i].dataset.precision || 0,
										position: list[i].dataset.position || 'outside',
										outsidePadding: list[i].dataset.outsidepadding || 4,
										textMargin: list[i].dataset.textmargin || 4,
										showActualPercentages: true
									}
							    }
	        				}
	        			};
	        			console.log(pconfig.options.plugins);
	        			if(undefined != labels && labels.length > 0){
							pconfig.data.labels=labels;
						}
	        			let pcanvas=document.createElement('canvas');
	        			list[i].appendChild(pcanvas);
	        			let pctx = pcanvas.getContext('2d');
						wacss.chartjs[list[i].id]  = new Chart(pctx, pconfig);
						//console.log(pconfig);
						/* check for data-onclick */
						if(undefined != list[i].getAttribute('data-onclick')){
							pcanvas.parentobj=list[i];
							pcanvas.chartobj=wacss.chartjs[list[i].id];
							pcanvas.onclick_func=list[i].getAttribute('data-onclick');
							pcanvas.clicked=0;
							pcanvas.onclick = function(evt){
								if(this.clicked==0){
									this.clicked=1;
							        //set clicked back to 0 in 250 ms (this prevents duplicate click events)
							        this.timeout=setTimeout(function(obj){obj.clicked=0;}, 250,this);
									let activePoints = this.chartobj.getElementsAtEventForMode(evt, 'point', this.chartobj.options);
							        if(activePoints.length > 0){
								        let firstPoint = activePoints[0];
								        let params={};
								        params.parent=this.parentobj;
								        params.chart=this.chartobj;
								        params.type=this.parentobj.getAttribute('data-type');
								        params.label = this.chartobj.data.labels[firstPoint._index] || this.chartobj.data.datasets[firstPoint._datasetIndex].label;
								        params.value = this.chartobj.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
								        window[this.onclick_func](params);
								    }
							    }
							};
						}
					}
				break;
			}
		}
		return true;
	},
	hexToRgb: function(hex) {
		if(undefined==hex){
			return {
				r:255,
				g:255,
				b:255
			};
		}
		//check for rgb(r,g,b) string;
		let rgb_regex=/rgb\(([0-9]+?),\ ([0-9]+?),\ ([0-9]+?)\)/;
		let rgb_match=hex.toString().match(rgb_regex);
		if(undefined != rgb_match && undefined != rgb_match[1]){
			return {r:rgb_match[1],g:rgb_match[2],b:rgb_match[3]};
		}
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function (m, r, g, b) {
			return r + r + g + g + b + b;
		});

		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : {
			r:255,
			g:255,
			b:255
		}
		;
    },
	initCodeMirror: function(){
		/*convert texteara to codemirror */
		let list=document.querySelectorAll('textarea.code[data-mode]');
		if(undefined == list || list.length==0){return false;}
		//set some defaults
		let defaults={
	    	mode:'text/x-sql',
	    	indentUnit:4,
		    indentWithTabs: true,
		    smartIndent: true,
		    lineNumbers: true,
		    lineWrapping:false,
		    matchBrackets : true,
		    autofocus: false,
		    autoRefresh: true,
		    extraKeys: {
		    	"Ctrl-Space": "autocomplete",
		    	"F11": function(cm) {
		        	cm.setOption("fullScreen", !cm.getOption("fullScreen"));
		        },
		        "Esc": function(cm) {
		        	if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
		        }
		    }
	  	};
	  	//set a cm object
		if(undefined==this.codemirror){
			this.codemirror={};
		}
		for(let i=0;i<list.length;i++){
			//check to see if we have already initialized this element
			if(undefined != list[i].codemirror){continue;}
			//go through dataset to get params
			let params={};
			for(k in list[i].dataset){
				if(k=='debug'){continue;}
				let v=list[i].dataset[k];
				if (typeof v === 'string' || v instanceof String){
					switch(v){
						case 'true':
		  					v=true;
		  				break;
		  				case 'false':
		  					v=false;
		  				break;
					}
				}
				params[k]=v;
			}
			//fix modes
			switch(params.mode.toLowerCase()){
				case 'css':
				case 'text/css':
					params.mode='text/css';
				break;
				case 'html':
				case 'text/html':
					params.mode='text/html';
					defaults.htmlMode=true;
				break;
				case 'ini':
				case 'text/x-ini':
					params.mode='text/x-ini';
				break;
				case 'javascript':
				case 'text/javascript':
					params.mode='text/javascript';
					defaults.continueComments='Enter';
					defaults.extraKeys["Ctrl-Q"]='toggleComment';
				break;
				case 'json':
				case 'application/x-json':
					params.mode='application/x-json';
					defaults.autoCloseBrackets=true;
					defaults.matchBrackets=true;
					defaults.lineWrapping=true;
				break;
				case 'lua':
				case 'text/x-lua':
					params.mode='text/x-lua';
				break;
				case 'perl':
				case 'text/x-perl':
					params.mode='text/x-perl';
				break;
				case 'php':
				case 'application/x-httpd-php':
					params.mode='application/x-httpd-php';
				break;
				case 'python':
					params.mode={name:'python',version:3,singleLineStringErrors:false};
				break;
				case 'sql':
				case 'text/x-sql':
					params.mode='text/x-sql';
				break;
				case 'vbscript':
				case 'text/vbscript':
					params.mode='text/vbscript';
				break;
				case 'xml':
				case 'application/xml':
					params.mode='application/xml';
				break;
			}
			for(k in defaults){
	  			if(undefined == params[k]){
	  				params[k]=defaults[k];
	  			}
	  		}
	  		if(undefined != list[i].dataset.debug){
	  			console.log(list[i]);
	  			console.log(params);
	  		}
			let cm = CodeMirror.fromTextArea(list[i], params);
			//save the codemirror object to the textarea so we can find it easier
			list[i].codemirror=cm;
			//save changes to textarea
	  		cm.on('change', function(cm){cm.save();});
	  	}
	},
	initEditor: function(){
		let els=document.querySelectorAll('textarea[data-behavior="editor"]');
		if(els.length==0){return false;}
		for(e=0;e<els.length;e++){
			if(undefined != els[e].getAttribute('data-initialized')){continue;}
			els[e].setAttribute('data-initialized',1);
			let mh=els[e].style.minHeight || '200px';
			els[e].style.display='none';
			let editor=document.createElement('div');
			editor.setAttribute('contenteditable','true');
			editor.style.minHeight=mh;
			editor.saveto=els[e];
			els[e].editor=editor;
			//enable special keys
			editor.onkeydown=function(e){
				let evt = e || window.event;
			    let keyCode = evt.charCode || evt.keyCode;
			    //console.log(evt.ctrlKey)
			    //console.log(keyCode);
			    //get the selected text, if any
			    let sel = '';
			    if (window.getSelection) {
			        sel = window.getSelection().toString();
			    } else if (document.selection && document.selection.type != "Control") {
			        sel = document.selection.createRange().text;
			    }
			    switch(keyCode){
			    	case 9:
			    		//tab
			    		evt.preventDefault();
			    		document.execCommand('insertHTML', false, '\u0009');
			    	break;
			    	case 85:
			    		if(evt.altKey && sel.length){
			    			//Alt+U => uppercase
			    			evt.preventDefault();
			    			document.execCommand('insertHTML', false, sel.toUpperCase());
			    		}
			    	break;
			    	case 76:
			    		if(evt.altKey && sel.length){
			    			//Alt+l => lowercase
			    			evt.preventDefault();
			    			document.execCommand('insertHTML', false, sel.toLowerCase());
			    		}
			    	break;
			    	case 72:
			    		if(evt.altKey){
			    			//Alt+h => help
			    			evt.preventDefault();
			    			let help='EDITOR COMMAND REFERENCE:\r\n\r\n';
			    			help+='Alt+u => uppercase selection\r\n';
			    			help+='Alt+l => lowercase selection\r\n';
			    			help+='Ctrl+b => bold selection\r\n';
			    			help+='Ctrl+i => italic selection\r\n';
			    			help+='Ctrl+u => underline selection\r\n';
			    			help+='Alt+c => clear all formatting';
			    			alert(help);
			    		}
			    	break;
			    	case 67:
			    		if(evt.altKey){
			    			//Alt+c => clear formatting
			    			if(confirm('Clear all formatting?')){
			    				evt.preventDefault();
			    				this.textContent=this.innerText;
			    			}
			    		}
			    	break;
			    }
			}
			//paste text as plain text
			editor.addEventListener("paste", function(e) {
				e.preventDefault();
  				let text = e.clipboardData.getData('text/plain');
  				document.execCommand("insertHTML", false, text);
			});
			//update the textarea anytime it changes
			editor.addEventListener("input", function(ie) {
				//console.log(this.innerHTML);
				//console.log(this.innerText);
				//console.log(this.textContent);
				this.saveto.innerHTML=this.innerText;
			});
			editor.save=function() {
				this.saveto.innerHTML=this.innerText;
			};
			//set initial value the same as textarea
			editor.textContent=els[e].textContent;
			//setEditorMarkup(editor);
			els[e].parentNode.insertBefore(editor, els[e].nextSibling);
		}
	},
	initWacssEdit: function(){
		/*convert texteara to contenteditable div*/
		let list=document.querySelectorAll('textarea.wacssedit');
		for(let i=0;i<list.length;i++){
			if(undefined == list[i].id){continue;}
			//check to see if we have already initialized this element
			if(undefined != list[i].getAttribute('data-initialized')){continue;}
			list[i].setAttribute('data-initialized',1);
			let editor_id=list[i].id+'_wacsseditor';
			//does it already exist?
			let eobj=wacss.getObject(editor_id);
			if(undefined != eobj){continue;}
			//create a contenteditable div
			let attrs=wacss.getAllAttributes(list[i]);
			let d = document.createElement('div');
			d.id=editor_id;
			list[i].setAttribute('data-editor',d.id);
			d.setAttribute('data-editor',list[i].id);
			for(k in attrs){
				if(k=='id' || k=='data-editor'){continue;}
				d.setAttribute(k,attrs[k]);
			}
			d.addEventListener('input', function() {
				let eid=this.getAttribute('data-editor');
				let tobj=wacss.getObject(eid);
				if(undefined == tobj){
					console.log('textarea update failed: no eid: '+eid);
					return false;
				}
				tobj.innerHTML=this.innerHTML.replace(/</g,'&lt;').replace(/>/g,'&gt;');
			});
			d.setAttribute('contenteditable','true');
			d.innerHTML = list[i].value;
			list[i].original = list[i].value;
			//hide the textarea and show the contenteditable div in its place
			list[i].style.display='none';
			//wacssedit_bar
			let nav = document.createElement('nav');
			nav.className='nav w_white';
			if(undefined != list[i].getAttribute('data-bar-color')){
				nav.className='nav '+list[i].getAttribute('data-bar-color');
			}
			let ul = document.createElement('ul');
		
			//title,cmd,arg,icon,accesskey
			let buttons={
				'Reset':['reset','','icon-reset','r'],
				'Bold':['bold','','icon-bold','b'],
				'Italic':['italic','','icon-italic','i'],
				'Underline':['underline','','icon-underline','u'],
				'Delete':['delete','','icon-delete',''],
				'Cut':['cut','','icon-scissors',''],
				'Copy':['copy','','icon-copy','c'],
				'Quote':['formatBlock','blockquote','icon-code','q'],
				'Heading':['heading','','',''],
				'Font':['fontName','','',''],
				'Size':['fontSize','','',''],
				'Color':['','','icon-color-adjust',''],
				'Media':['','','icon-image',''],
				'Justify':['justify','','',''],
				'Form':['form','','',''],
				'Unordered List':['insertUnorderedList','','icon-list-ul',''],
				'Ordered List':['insertOrderedList','','icon-list-ol',''],
				'Redo':['redo','','icon-redo','y'],
				'Undo':['undo','','icon-undo','z'],
				'Remove':['removeFormat','','icon-erase','-'],
				'Print':['print','','icon-print','p'],
				'Htmlcode':['code','','icon-file-code','h']
				
			}
			/*
				Features to add:
					fontName
			*/
			let databar=new Array();
			if(undefined != list[i].getAttribute('data-bar')){
				let barstr=list[i].getAttribute('data-bar');
				let btns=barstr.split(',');
				for(let db=0;db<btns.length;db++){
					databar.push(wacss.ucwords(btns[db]));
				}
			}
			//console.log('databar',databar);
			for(name in buttons){
				//console.log(name);
				if(databar.length > 0 && !wacss.in_array(name,databar)){
					continue;
				}
				let li=document.createElement('li');
				let parts;
				let a;
				let icon;
				switch(name.toLowerCase()){
					case 'media':
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title='Multimedia';
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						let micon=document.createElement('span');
						micon.className='icon-image';
						a.appendChild(micon);
						li.appendChild(a);
						let mediabox=document.createElement('div');
						/* URL */
						let murl=document.createElement('input');
						murl.type='text';
						murl.name='url';
						murl.placeholder='URL to media';
						murl.setAttribute('value','');
						mediabox.appendChild(murl);
						/* drag n drop or click to upload */
						let mfilebox=document.createElement('div');
						mfilebox.style.marginTop='10px';
						let mfile=document.createElement('input');
						mfile.type='file';
						mfile.accept='audio/*,video/*,image/*';
						mfile.id='mediafile';
						mfile.setAttribute('multiple','multiple');
						mfile.style.position='fixed';
						mfile.style.top='-1000px';
						mfile.filebox=mfilebox;
						mfile.onchange=function(evt){
							wacss.preventDefault(evt);
							wacss.wacsseditHandleFiles(this);
							return false;
						}
						mediabox.appendChild(mfile);
						let mdrop=document.createElement('label');
						mdrop.filebox=mfilebox;
						mdrop.addEventListener('dragenter',function(evt){
							wacss.preventDefault(evt);
							this.style.border='1px dashed #28a745';
							this.style.color='#28a745';
							return false;
						},false);
						mdrop.addEventListener('dragleave',function(evt){
							wacss.preventDefault(evt);
							this.style.border='1px dashed #ccc';
							this.style.color='#999999';
							return false;
						},false);
						mdrop.addEventListener('dragover',function(evt){
							wacss.preventDefault(evt);
						 	return false;
						},false);
						mdrop.addEventListener('drop',function(evt){
							wacss.preventDefault(evt);
  							this.files = evt.dataTransfer.files;
  							wacss.wacsseditHandleFiles(this);
							return false;
						},false);
						mdrop.setAttribute('for','mediafile');
						mdrop.style.display='block';
						mdrop.style.border='1px dashed #ccc';
						mdrop.style.borderRadius='5px';
						mdrop.style.marginTop='10px';
						mdrop.style.color='#999999';
						mdrop.style.padding='15px';
						mdrop.innerHTML='Drag n Drop<br />(or click to browse)';
						mdrop.style.textAlign='center';
						mdrop.style.backgroundColor='#FFF';
						mediabox.appendChild(mdrop);
						mediabox.appendChild(mfilebox);
						/* max width and max height */
						let mmaxbox=document.createElement('div');
						mmaxbox.style.display='flex';
						mmaxbox.style.flexDirection='row';
						mmaxbox.style.marginTop='10px';
						/* max width */
						let mwidth=document.createElement('input');
						mwidth.type='text';
						mwidth.name='width';
						mwidth.placeholder='Width';
						mwidth.title="Max Width - defaults to 200px";
						mwidth.style.flex='1 1 auto';
						mwidth.style.marginRight='5px';
						mwidth.pattern='[0-9px\%]+';
						mwidth.oninput=function(){this.reportValidity();};
						mmaxbox.appendChild(mwidth);
						/* max height */
						let mheight=document.createElement('input');
						mheight.type='text';
						mheight.name='height';
						mheight.placeholder='Height';
						mheight.title='Max Height - defaults to 200px';
						mheight.style.flex='1 1 auto';
						mheight.style.marginLeft='5px';
						mheight.pattern='[0-9px\%]+';
						mheight.oninput=function(){this.reportValidity();};
						mmaxbox.appendChild(mheight);

						mediabox.appendChild(mmaxbox);

						/* align and border */
						let mabbox=document.createElement('div');
						mabbox.style.display='flex';
						mabbox.style.flexDirection='row';
						mabbox.style.marginTop='10px';
						/* align */
						let malign=document.createElement('select');
						malign.style.flex='1 1 auto';
						malign.title='Align';
						malign.name="align";
						malign.style.marginRight='5px';
						let malign_opts=new Array('left','center','right');
						for(let opt in malign_opts){
							let malign_opt=document.createElement('option');
							malign_opt.value=malign_opts[opt];
							malign_opt.innerText=malign_opts[opt];
							malign.appendChild(malign_opt);
						}
						mabbox.appendChild(malign);
						/* border */
						let mborder=document.createElement('input');
						mborder.type='checkbox';
						mborder.name="border";
						mborder.style.flex='1 1 auto';
						mborder.title='Border';
						mborder.style.marginLeft='5px';
						mabbox.appendChild(mborder);

						mediabox.appendChild(mabbox);

						/* save and reset  */
						let msrbox=document.createElement('div');
						msrbox.style.display='flex';
						msrbox.style.flexDirection='row';
						msrbox.style.marginTop='10px';
						/* reset */
						let mreset=document.createElement('button');
						mreset.style.flex='1 1 auto';
						mreset.title='Reset';
						mreset.type='button';
						mreset.innerText='Reset';
						mreset.className='btn w_red';
						mreset.elems=new Array(murl,mfilebox,mwidth,mheight,mborder);
						mreset.onclick=function(){
							for(let x in this.elems){
								switch(this.elems[x].tagName.toLowerCase()){
									case 'div':
										this.elems[x].innerHTML='';	
									break;
									case 'input':
										switch(this.elems[x].type.toLowerCase()){
											case 'text':
												this.elems[x].value='';
											break;
											case 'checkbox':
												this.elems[x].checked=false;
											break;
										}	
									break;
								}
								
							}
						}
						mreset.style.marginRight='5px';
						msrbox.appendChild(mreset);
						/* save */
						let msave=document.createElement('button');
						msave.style.flex='1 1 auto';
						msave.title='Reset';
						msave.type='button';
						msave.innerText='Save';
						msave.className='btn w_green';
						msave.style.marginRight='5px';
						msave.mwidth=mwidth;
						msave.mheight=mheight;
						msave.malign=malign;
						msave.mborder=mborder;
						msave.murl=murl;
						msave.mfiles=mfilebox;
						msave.li=li;
						msave.elems=new Array(murl,mfilebox,mwidth,mheight,mborder);
						msave.onclick=function(){
							let width='300px';
							if(undefined != this.mwidth.value && this.mwidth.value.length){width=this.mwidth.value;}
							if(width.indexOf('px')==-1 && width.indexOf('%')==-1){
								width=width+'px';
							}
							let height='200px';
							if(undefined != this.mheight.value && this.mheight.value.length){height=this.mheight.value;}
							if(height.indexOf('px')==-1 && height.indexOf('%')==-1){
								height=height+'px';
							}
							let align=msave.malign.value;
							let style="max-width:"+width+";max-height:"+height+";";
							if(undefined != this.mborder && this.mborder.checked){style=style+'border:1px outset #000;';}
							document.execCommand('removeFormat',false);
							/* image */
							let list=this.mfiles.querySelectorAll('img');	
							for(let y=0;y<list.length;y++){
								let htm='<div style="text-align:'+align+';"><img src="'+list[y].src+'" style="'+style+'" /></div>';
							 	document.execCommand("insertHTML", false, htm);
							}
							/* audio */
							list=this.mfiles.querySelectorAll('audio');	
							for(let y=0;y<list.length;y++){
								let htm='<div style="text-align:'+align+';"><audio src="'+list[y].src+'" style="'+style+'" controls="controls" /></div>';
							 	document.execCommand("insertHTML", false, htm);
							}
							/* video */
							list=this.mfiles.querySelectorAll('video');	
							for(let y=0;y<list.length;y++){
								let htm='<div style="text-align:'+align+';"><video src="'+list[y].src+'" style="'+style+'" controls="controls" /></div>';
							 	document.execCommand("insertHTML", false, htm);
							}
							/* url */
							if(this.murl.value.length){
								let ext=this.murl.value.split('.').pop();
								let style='';
								let htm='';
								switch(ext.toLowerCase()){
									case 'png':
									case 'jpg':
									case 'jpeg':
									case 'gif':
									case 'svg':
										htm='<div style="text-align:'+align+';"><img src="'+this.murl.value+'" style="'+style+'" /></div>';
									 	document.execCommand("insertHTML", false, htm);
									break;
									case 'mp3':
										htm='<div style="text-align:'+align+';"><audio src="'+this.murl.value+'" style="'+style+'" controls="controls" /></div>';
									 	document.execCommand("insertHTML", false, htm);
									break;
									case 'mp4':
										htm='<div style="text-align:'+align+';"><video src="'+this.murl.value+'" style="'+style+'" controls="controls" /></div>';
									 	document.execCommand("insertHTML", false, htm);
									break;
									default:
										//check for youtube
										if(this.murl.value.indexOf('youtube.com') != -1){
											/* https://www.youtube.com/watch?v=_DmM_6pa-TI replaced with  https://www.youtube.com/embed/_DmM_6pa-TI */
											let src=this.murl.value.replace('watch?v=','embed/');
											htm='<div style="text-align:'+align+';"><iframe src="'+src+'" style="'+style+'" ></iframe></div>';
										}
										else{
											htm='<div style="text-align:'+align+';"><embed src="'+this.murl.value+'" style="'+style+'" controls="controls" ></embed></div>';	
										}
										
									 	document.execCommand("insertHTML", false, htm);
									break;
								}
							}
							wacss.initWacssEditElements();
							//return false;
							/* reset the form */
							for(let x in this.elems){
								switch(this.elems[x].tagName.toLowerCase()){
									case 'div':
										this.elems[x].innerHTML='';	
									break;
									case 'input':
										switch(this.elems[x].type.toLowerCase()){
											case 'text':
												this.elems[x].value='';
											break;
											case 'checkbox':
												this.elems[x].checked=false;
											break;
										}	
									break;
								}
								
							}
							wacss.removeClass(this.li,'open');
							return false;
						};
						msrbox.appendChild(msave);

						mediabox.appendChild(msrbox);


						let mul=document.createElement('ul');
						mul.style.padding='10px';
						mul.appendChild(mediabox);
						li.appendChild(mul)
						break;

					break;
					case 'color':
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title='Text Color';
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						let cicon=document.createElement('span');
						cicon.className='icon-textcolor';
						a.appendChild(cicon);
						li.appendChild(a);
						let colors={
							r1:['#000000','#444444','#666666','#999999','#cccccc','#eeeeee','#f3f3f3','#ffffff'],
							r2:['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#0000ff','#9900ff','#ff00ff'],
							r3:['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#cfe2f3','#d9d2e9','#ead1dc'],
							r4:['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#b4a7d6','#d5a6bd'],
							r5:['#e06666','#ebaa66','#fad564','#8ab976','#729fa9','#6aa1d2','#8776b9','#bd789b'],
							r6:['#bc0000','#dc8b36','#e1b52f','#659f4b','#427b88','#3a7ebc','#5c4594','#9f4a74'],
							r7:['#8d0000','#a45705','#b88b00','#36721c','#124a57','#0b508f','#321a6e','#6e1a43'],
							r8:['#5f0000','#6f3a04','#775a00','#254b12','#0b313a','#07335c','#1e1149','#48102e']
						};
						let colorflexbox=document.createElement('div');
						colorflexbox.style.display='flex';
						/* Background Color */
						let bgbox=document.createElement('div');
						bgbox.style.flex='1 1 0';
						bgbox.style.borderRight='10px solid transparent';
						let title=document.createElement('div');
						title.style.textAlign='left';
						title.style.color='#000000';
						title.innerText='Background Color';
						title.style.padding='5px 0 5px 0';
						bgbox.appendChild(title);
						let table=document.createElement('table');
						table.style.width='98%';
						table.style.borderCollapse='separate';
						table.style.borderSpacing='2px';
						for(let k in colors){
							let tr=document.createElement('tr');
							for(t=0;t<colors[k].length;t++){
								let td=document.createElement('td');
								td.style.padding='0px';
								let b=document.createElement('button');
								b.className='wacssedit';
								b.style.backgroundColor=colors[k][t];
								b.style.width='16px';
								b.style.height='16px';
								b.style.border='1px solid transparent';
								b.setAttribute('data-cmd','backColor');
								b.setAttribute('data-arg',colors[k][t]);
								b.setAttribute('title',colors[k][t]);
								b.setAttribute('data-txt',list[i].id);
								b.onmouseover=function(){
									this.style.border='1px solid #000';
								};
								b.onmouseout=function(){
									this.style.border='1px solid transparent';
								};
								td.appendChild(b);
								tr.appendChild(td);
							}
							table.appendChild(tr);
						}
						bgbox.appendChild(table);
						/* Text Color */
						let tbox=document.createElement('div');
						tbox.style.flex='1 1 0';
						title=document.createElement('div');
						title.style.textAlign='left';
						title.style.color='#000000';
						title.innerText='Text Color';
						title.style.padding='5px 0 5px 0';
						tbox.appendChild(title);
						table=document.createElement('table');
						table.style.width='98%';
						table.style.borderCollapse='separate';
						table.style.borderSpacing='2px';
						for(let k in colors){
							let tr=document.createElement('tr');
							for(t=0;t<colors[k].length;t++){
								let td=document.createElement('td');
								td.style.padding='0px';
								let b=document.createElement('button');
								b.className='wacssedit';
								b.style.backgroundColor=colors[k][t];
								b.style.width='16px';
								b.style.height='16px';
								b.style.border='1px solid transparent';
								b.setAttribute('data-cmd','foreColor');
								b.setAttribute('data-arg',colors[k][t]);
								b.setAttribute('title',colors[k][t]);
								b.setAttribute('data-txt',list[i].id);
								b.onmouseover=function(){
									this.style.border='1px solid #000';
								};
								b.onmouseout=function(){
									this.style.border='1px solid transparent';
								};
								td.appendChild(b);
								tr.appendChild(td);
							}
							table.appendChild(tr);
						}
						tbox.appendChild(table);
						colorflexbox.appendChild(bgbox);
						colorflexbox.appendChild(tbox);
						let cul=document.createElement('ul');
						cul.style.padding='10px';
						cul.appendChild(colorflexbox);
						li.appendChild(cul)
						break;

					break;
					case 'heading':
						//headings H1-6
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title=name;
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						a.innerHTML=name;
						li.appendChild(a);
						let hul=document.createElement('ul');
						hul.style.maxHeight='175px';
						hul.style.overflow='auto';
						for(let h=1;h<7;h++){
							let hname='H'+h;
							let hli=document.createElement('li');
							hul.appendChild(hli);
							ha=document.createElement('button');
							ha.className='wacssedit';
							let hh=document.createElement(hname);
							hh.innerHTML=hname;
							ha.appendChild(hh);
							ha.setAttribute('data-cmd','formatBlock');
							ha.setAttribute('data-arg','H'+h);
							ha.setAttribute('data-txt',list[i].id);
							hli.appendChild(ha);
						}
						
						li.appendChild(hul);

					break;
					case 'font':
						//justify full,left,center,right
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title=name;
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						a.innerHTML=name;
						li.appendChild(a);
						let fnul=document.createElement('ul');
						fnul.style.maxHeight='175px';
						fnul.style.overflow='auto';
						let fonts=new Array('Arial','Helvetica','Times New Roman','Times','Courier New','Courier','Verdana','Georgia','Palatino','Garamond','Bookman','Comic Sans MS','Trebuchet MS','Arial Black','Impact');
						for(let fn=0;fn<fonts.length;fn++){
							let fnli=document.createElement('li');
							fnul.appendChild(fnli);
							fna=document.createElement('button');
							fna.className='wacssedit';
							fna.setAttribute('data-cmd','fontName');
							fna.setAttribute('data-arg',fonts[fn]);
							fna.setAttribute('data-txt',list[i].id);
							fna.style.fontFamily=fonts[fn];
							fna.innerHTML=fonts[fn];
							fnli.appendChild(fna);
						}
						li.appendChild(fnul);
					break;
					case 'size':
						//headings H1-6
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title='Text Size';
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						let sicon=document.createElement('span');
						sicon.className='icon-textsize';
						a.appendChild(sicon);
						li.appendChild(a);
						let fsul=document.createElement('ul');
						fsul.style.maxHeight='175px';
						fsul.style.overflow='auto';
						for(let fs=1;fs<7;fs++){
							let fsname='Size '+fs;
							let fsli=document.createElement('li');
							fsul.appendChild(fsli);
							let fsa=document.createElement('button');
							fsa.className='wacssedit';
							let fsf=document.createElement('font');
							fsf.setAttribute('size',fs);
							fsf.innerHTML=fsname;
							fsa.appendChild(fsf);
							fsa.setAttribute('data-cmd','fontSize');
							fsa.setAttribute('data-arg',fs);
							fsa.setAttribute('data-txt',list[i].id);
							fsli.appendChild(fsa);
						}
						li.appendChild(fsul);
					break;
					case 'justify':
						//justify full,left,center,right
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title=name;
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						a.innerHTML=name;
						li.appendChild(a);
						let jul=document.createElement('ul');
						jul.style.maxHeight='175px';
						jul.style.overflow='auto';
						let jopts=new Array('indent','outdent','full','left','center','right',);
						for(let j=0;j<jopts.length;j++){
							let jname=wacss.ucwords(jopts[j]);
							let jli=document.createElement('li');
							jul.appendChild(jli);
							ja=document.createElement('button');
							ja.className='wacssedit';
							ja.setAttribute('data-txt',list[i].id);
							let jicon=document.createElement('span');
							switch(jopts[j]){
								case 'indent':
								case 'outdent':
									ja.setAttribute('data-cmd',jopts[j]);
									jicon.className='icon-'+jopts[j];
								break;
								default:
									ja.setAttribute('data-cmd','justify'+jname);
									jicon.className='icon-justify-'+jopts[j];
								break;	
							}
							ja.appendChild(jicon);
							let jtxt=document.createElement('span');
							jtxt.innerHTML=' '+jname;
							ja.appendChild(jtxt);
							jli.appendChild(ja);
						}
						li.appendChild(jul);
					break;
					case 'form':
						//justify full,left,center,right
						//Multi-media insert:  https://www.froala.com/wysiwyg-editor/examples/custom-image-button
						a=document.createElement('button');
						a.className='wacssedit dropdown';
						a.title=name;
						a.li=li;
						a.onclick=function(){
							let list=wacss.getSiblings(this.li);
							for(let s=0;s<list.length;s++){
								wacss.removeClass(list[s],'open');
							}
							wacss.toggleClass(this.li,'open');
							return false;
						};
						a.innerHTML=name;
						a.style.color='#3d7a7a';
						li.appendChild(a);
						let sul=document.createElement('ul');
						sul.style.maxHeight='325px';
						sul.style.overflow='auto';
						let types={
							date:'Date Picker <span class="icon-calendar"></span>',
							raten5:'Rating Number 1 - 5 <span class="icon-radio-button w_smaller"></span>',
							raten10:'Rating Number 1 - 10 <span class="icon-radio-button w_smaller"></span>',
							rates5:'Rating Stars 1 -5 <span class="icon-star-empty"></span>',
							rates10:'Rating Stars 1 -10 <span class="icon-star-empty"></span>',
							one:'Select One <span class="icon-checkbox"></span>',
							many:'Select Multiple <span class="icon-checkbox"></span> <span class="icon-checkbox"></span>',
							hideonview:'Hide On View <span class="icon-moon-quarter"></span>',
							section:'Section Marker <span class="icon-bookmark"></span>',
							signature:'Signature <span class="icon-signature"></span>',
							text:'Text One <span class="icon-text"></span>',
							textarea:'Text Multiple <span class="icon-textarea"></span>',
							customcode:'Insert Custom Code {}'
						};
						for(let type in types){
							let sli=document.createElement('li');
							sul.appendChild(sli);
							sna=document.createElement('button');
							sna.className='wacssedit';
							sna.style.color='#3d7a7a';
							sna.setAttribute('data-cmd','form');
							sna.setAttribute('data-arg',type);
							sna.setAttribute('data-txt',list[i].id);
							sna.innerHTML=types[type];
							sli.appendChild(sna);
						}
						li.appendChild(sul);
					break;
					default:
						parts=buttons[name];
						a=document.createElement('button');
						a.className='wacssedit';
						a.title=name;
						a.onclick=function(){return false;};
						a.setAttribute('data-txt',list[i].id);
						if(parts[3].length){
							a.setAttribute('accesskey',parts[3]);
							a.title=a.title+' (ALT-'+parts[3]+')';
						}
						a.setAttribute('data-cmd',parts[0]);
						if(parts[1].length){
							a.setAttribute('data-arg',parts[1]);
						}
						if(parts[2].length){
							//icon
							icon=document.createElement('span');
							icon.className=parts[2];
							a.appendChild(icon);
						}
						li.appendChild(a);
					break;
				}
				ul.appendChild(li);
			}
			nav.appendChild(ul);
			
			list[i].parentNode.insertAdjacentElement('afterBegin',d);
			list[i].parentNode.insertAdjacentElement('afterBegin',nav);
			
			//list[i].parentNode.replaceChild(d, list[i]);
		}
		if(list.length){
			document.execCommand('styleWithCSS',true,null);
		}
		list=document.querySelectorAll('button.wacssedit');
		for(i=0;i<list.length;i++){
			let cmd=list[i].getAttribute('data-cmd');
			if(undefined == cmd){continue;}
			list[i].setAttribute('data-wacssedit-cmd',cmd);
			list[i].onclick=function(event){
				event.preventDefault();
				let cmd=this.getAttribute('data-cmd');
				//console.log('onclick',cmd);
				let tid=this.getAttribute('data-txt');
				let tobj=wacss.getObject(tid);
				if(undefined == tobj){
					console.log('wacssedit code error: no tobj');
					return false;
				}
				let dobj=getObject(tid+'_wacsseditor');
				if(undefined == dobj){
					console.log('wacssedit code error: no dobj');
					wacss.initWacssEditElements();
					return false;
				}
				switch(cmd){
					case 'form':
						let arg=this.getAttribute('data-arg');
						document.execCommand('removeFormat',false);
					 	document.execCommand("insertHTML", false, "<span class='wacssform_"+arg+"'>"+ document.getSelection()+'</span>');
					 	wacss.initWacssEditElements();
					 	return false;
					break;
					case 'reset':
						if(confirm('Reset back to original?'+dobj.original)){
							dobj.innerHTML=tobj.original;
						}
						wacss.initWacssEditElements();
						return false;
					break;
					case 'print':
						let oPrntWin = window.open("","_blank","width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
						oPrntWin.document.open();
						oPrntWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + dobj.innerHTML + "<\/body><\/html>");
						oPrntWin.document.close();
						wacss.initWacssEditElements();
						return false;
					break;
					case 'code':
						if(tobj.style.display=='none'){
							//switch to textarea edit mode
							dobj.removeEventListener('input', function() {
								let eid=this.getAttribute('data-editor');
								let tobj=getObject(eid);
								if(undefined == tobj){
									console.log('textarea update failed: no eid: '+eid);
									wacss.initWacssEditElements();
									return false;
								}
								tobj.innerHTML=this.innerHTML.replace(/</g,'&lt;').replace(/>/g,'&gt;');
							});
							dobj.style.display='none';
							tobj.style.display='block';
							tobj.focus();
							tobj.addEventListener('input', function() {
								let eid=this.getAttribute('data-editor');
								let tobj=wacss.getObject(eid);
								if(undefined == tobj){
									console.log('textarea update failed: no eid: '+eid);
									wacss.initWacssEditElements();
									return false;
								}
								tobj.innerHTML=this.value;
							});
						}
						else{
							//switch to wysiwyg edit mode 
							tobj.removeEventListener('input', function() {
								let eid=this.getAttribute('data-editor');
								let tobj=getObject(eid);
								if(undefined == tobj){
									console.log('textarea update failed: no eid: '+eid);
									wacss.initWacssEditElements();
									return false;
								}
								tobj.innerHTML=this.value;
							});
							tobj.style.display='none';
							dobj.style.display='block';
							dobj.focus();
							dobj.addEventListener('input', function() {
								let eid=this.getAttribute('data-editor');
								let tobj=wacss.getObject(eid);
								if(undefined == tobj){
									console.log('textarea update failed: no eid: '+eid);
									wacss.initWacssEditElements();
									return false;
								}
								tobj.value=this.innerHTML;
							});
						}
						wacss.initWacssEditElements();
						return false;
					break;
					default:
						if(undefined == this.getAttribute('data-arg')){
							//console.log(cmd);
							document.execCommand(cmd,false,null);
						}
						else{
							let arg=this.getAttribute('data-arg');
							//console.log(cmd,arg);
							document.execCommand(cmd,false,arg);
						}
						tobj.innerHTML=dobj.innerHTML;
						wacss.initWacssEditElements();
						return false;
					break;
				}
				wacss.initWacssEditElements();
			};
		}
		wacss.initWacssEditElements();
	},
	initWacssEditElements: function(){
		let list=document.querySelectorAll('[contenteditable] .wacssform_one');
		for(let i=0;i<list.length;i++){
			let p=wacss.getParent(list[i],'div');
			if(undefined == p || undefined == p.nextSibling){continue;}
			let lis=p.nextSibling.querySelectorAll('ul li');
			for(let x=0;x<lis.length;x++){
				lis[x].className='wacssform_one';
			}
		}
		list=document.querySelectorAll('[contenteditable] .wacssform_many');
		for(let i=0;i<list.length;i++){
			let p=wacss.getParent(list[i],'div');
			if(undefined == p || undefined == p.nextSibling){continue;}
			let lis=p.nextSibling.querySelectorAll('ul li');
			for(let x=0;x<lis.length;x++){
				lis[x].className='wacssform_many';
			}
		}
	},
	isNum: function(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	},
	listen: function(evnt, elem, func) {
	    if (elem.addEventListener){ 
	    	// W3C DOM
	    	elem.addEventListener(evnt,func,false);
	    }  
	    else if (elem.attachEvent) { 
	    	// IE DOM
	         let r = elem.attachEvent("on"+evnt, func);
	         return r;
	    }
	    else{
	    	console.log('wacss.listen failed. Browser does not support event listeners');
	    }
	},
	loadCSS: function(file,notify) {
	    let link = document.createElement('link');
	    if(undefined != notify && notify==1){
	    	link.onload = function () {
		    //do stuff with the script
		    wacss.toast(this.getAttribute('href')+' loaded successfully');
			};
	    }
	    link.setAttribute("rel", "stylesheet");
  		link.setAttribute("type", "text/css");
  		link.setAttribute("href", file);
		document.head.appendChild(link);
		return true;
	},
	loadJs: function(file,notify) {
		return wacss.loadScript(file,notify);
	},
	loadScript: function(file,notify) {
	    let script = document.createElement('script');
	    if(undefined != notify && notify==1){
	    	script.onload = function () {
		    //do stuff with the script
		    wacss.toast(this.src+' loaded successfully');
			};
	    }
		script.src = file;
		document.head.appendChild(script);
		return true;
	},
	modalClose: function(){
		if(undefined != document.getElementById('wacss_modal_overlay')){
			return wacss.removeObj(document.getElementById('wacss_modal_overlay'));
		}
		else if(undefined != document.getElementById('wacss_modal')){
			return wacss.removeObj(document.getElementById('wacss_modal'));
		}
	},
	modalTitle: function(title){
		if(undefined != document.getElementById('wacss_modal')){
			let m=document.getElementById('wacss_modal');
			let mt=m.querySelector('.wacss_modal_title_text');
			if(undefined != mt){
				mt.innerHTML=title;
			}
			centerObject(m);
			return m;
		}
	},
	modalPopupId: function(id,title,params){
		let htm='';
		if(undefined != document.querySelector(id)){
			htm=document.querySelector(id).innerHTML;
		}
		else if(undefined != document.querySelector('#'+id)){
			htm=document.querySelector('#'+id).innerHTML;
		}
		return wacss.modalPopup(htm,title,params);
	},
	modalPopup: function(htm,title,params){
		if(undefined == params){params={};}
		if(undefined == title){title='';}
		if(undefined != document.getElementById('wacss_modal')){
			let m=document.getElementById('wacss_modal');
			let mel=m.querySelector('.wacss_modal_content');
			if(undefined != mel){
				mel.innerHTML=htm;
			}
			if(title.length > 0){
				let mt=m.querySelector('.wacss_modal_title_text');
				if(undefined != mt){
					mt.innerHTML=title;
				}
			}
			centerObject(m);
			return m;
		}
		if(undefined == params.color){
			params.color=wacss.color();
		}
		let modal=document.createElement('div');
		modal.id='wacss_modal';
		let modal_close=document.createElement('span');
		modal.className='wacss_modal';
		if(undefined!=title && title.length > 0){
			//default titlebar color to light if not specified in params
			let modal_title=document.createElement('div');
			modal_title.className='wacss_modal_title '+params.color;
			modal_close.className='wacss_modal_close icon-close';
			modal_close.title="Close";
			modal_close.onclick=function(){
				wacss.removeObj(this.pnode);
			}
			modal_title.appendChild(modal_close);
			let modal_title_text=document.createElement('div');
			modal_title_text.className='wacss_modal_title_text';
			modal_title_text.innerHTML=title;
			modal_title.appendChild(modal_title_text);
			modal.appendChild(modal_title);

		}
		let modal_content=document.createElement('div');
		modal_content.className='wacss_modal_content';
		modal_content.innerHTML=htm;
		modal.appendChild(modal_content);
		if(undefined != params.overlay){
			let modal_overlay=document.createElement('div');
			modal_overlay.id='wacss_modal_overlay';
			modal_overlay.className='wacss_modal_overlay '+params.color;
			modal_overlay.appendChild(modal);
			modal_close.pnode=modal_overlay;
			if(undefined != params.overlay_close){
				modal_overlay.onclick = function(){
					//get the element where the click happened using hover
					let elements = document.querySelectorAll(':hover');
					let i=elements.length-1;
					if(this == elements[i]){
						wacss.removeObj(this);	
					}
				};
			}
			else{
				modal_overlay.onclick = function(){
					//get the element where the click happened using hover
					let elements = document.querySelectorAll(':hover');
					let i=elements.length-1;
					if(this == elements[i]){
						wacss.blink('wacss_modal');	
					}
				};
			}
			document.body.appendChild(modal_overlay);
		}
		else{
			modal_close.pnode=modal;
			document.body.appendChild(modal);
		}
		centerObject(modal);
		return modal;
	},
	navMobileToggle: function(el){
		let navs=document.querySelectorAll('.nav');
		for(let n=0;n<navs.length;n++){
			let lis=navs[n].querySelectorAll('li');
			for(let l=0;l<lis.length;l++){
				if(lis[l]==el){
					/* this  is the right nav */
					if(navs[n].className.indexOf('leftmenu') != -1){
						wacss.removeClass(navs[n],'leftmenu');	
					}
					else{
						wacss.addClass(navs[n],'leftmenu');
					}
				}
			}
		}
		return false;
	},
	preventDefault: function(evt){
		evt = evt || window.event;
		if (evt.preventDefault){evt.preventDefault();}
		if (evt.stopPropagation){evt.stopPropagation();}
	 	if (evt.cancelBubble !== null){evt.cancelBubble = true;}
	},
	removeClass: function(element, classToRemove) {
		element=wacss.getObject(element);
		if(undefined == element.className){return;}
	    let currentClassValue = element.className;

	    // removing a class value when there is more than one class value present
	    // and the class you want to remove is not the first one
	    if (currentClassValue.indexOf(" " + classToRemove) != -1) {
	        element.className = element.className.replace(" " + classToRemove, "");
	        return;
	    }

	    // removing the first class value when there is more than one class value present
	    if (currentClassValue.indexOf(classToRemove + " ") != -1) {
	        element.className = element.className.replace(classToRemove + " ", "");
	        return;
	    }

	    // removing the first class value when there is only one class value present
	    if (currentClassValue.indexOf(classToRemove) != -1) {
	        element.className = element.className.replace(classToRemove, "");
	        return;
	    }
	},
	removeObj: function(obj){
		//info: removes specified id
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
	},
	scrollToBottom: function(el){
		el=wacss.getObject(el);
		if(undefined == el){return false;}
		if(undefined == el.scrollHeight){return false;}
		if(undefined != el.clientHeight){
			el.scrollTop = el.scrollHeight - el.clientHeight;
		}
		else{
			el.scrollTop = el.scrollHeight;
		}
		return false;
	},
	setActiveTab: function(el){
	    let p=wacss.getParent(el,'ul','nav-tabs');
	    if(p === null){return false;}
	    let list=p.querySelectorAll('li');
	    for(let i=0;i<list.length;i++){
	        wacss.removeClass(list[i],'active');
	    }
	    //add active class to the li
	    if(el.nodeName.toLowerCase()=='li'){
	    	wacss.addClass(el,'active');	
	    }
	    else{
			let li=wacss.getParent(el,'li');
			let lip=wacss.getParent(li,'ul');
			if(!lip.classList.contains('nav-tabs')){
				wacss.addClass(li,'active');
				li=wacss.getParent(lip,'li');
			}
	    	wacss.addClass(li,'active');
	    }
	    return false;
	},
	showImage: function(el,z){
		el=wacss.getObject(el);
		if(undefined == el){return false;}
		z=z||10020;
		let d=document.createElement('div');
		d.id="modal1";
		//d.className='modal open';
		d.tabindex=0;
		d.style.zIndex=z;
		d.style.display='block';
		d.style.background='#FFF';
		d.style.padding='15px';
		d.style.border='1px outset #747392';
		d.style.borderRadius='3px';
		d.style.position='absolute';
		d.style.maxWidth='60%';
		d.style.maxHeight='800px';
		d.style.transform='scaleX(1) scaleY(1)';
		let i=document.createElement('img');
		i.src=el.getAttribute('src');
		i.style.maxWidth='100%';
		i.style.maxHeight='770px';
		i.d=d;
		i.onload=function(){
			centerObject(this.d);
		}
		d.appendChild(i)
		document.body.appendChild(d);
		z=z-2;
		// Build modal-overlay.
		let v=document.createElement('div');
		v.style.zIndex=z;
		v.style.display='block';
		v.style.width='3000px';
		v.style.height='2000px';
		v.style.position='absolute';
		v.style.top='0px';
		v.style.left='0px';
		v.style.background='rgba(0,0,0,0.5)';
		v.id=d.id+'_overlay';
		v.setAttribute('data-target',d.id);
		v.onclick=function(){
			removeDiv(this.getAttribute('data-target'));
			removeDiv(this.id);
		};
		document.body.appendChild(v);

	},
	simulateEvent: function(element, eventName){
		element=getObject(element);
		if(undefined == element){return false;}
		//info: simulate an event without it actually happening
	    let evObj = document.createEvent('Event');
	    evObj.initEvent(eventName, true, false);
	    element.dispatchEvent(evObj);
	  	return true;
	},
	speak: function(txt,params){
		if(undefined == params){params={};}
		params.txt=txt;
		if ('speechSynthesis' in window) {	
			/* cancel any speach already playing */
			window.speechSynthesis.cancel();
			/* check to see if voices are loaded already */
			let voices = window.speechSynthesis.getVoices();
			if(undefined != params.debug){
				console.log(voices);
			}
			if(voices.length > 0){
				let msg = new SpeechSynthesisUtterance();
				/* set any custom options */
				if(undefined != params.name){
					for(let i=0;i<voices.length;i++){
						if(voices[i].name.toLowerCase().indexOf(params.name.toLowerCase()) != -1){
							msg.voice=voices[i];
							break;
						}
					}
				}
				if(undefined != params.lang){
					msg.lang=params.lang;
				}
				if(undefined != params.volume){
					msg.volume=params.volume;
				}
				if(undefined != params.rate){
					msg.rate=params.rate;
				}
				if(undefined != params.pitch){
					msg.pitch=params.pitch;
				}
				msg.text=params.txt;
				if(undefined != params.debug){
					console.log(msg);
				}
				window.speechSynthesis.speak(msg);
				return false;
			}
			else{
				/* no voices loaded. Setup a promise and then call wacss.speak */
				window.speechSynthesis.params=params;
				window.speechSynthesis.onvoiceschanged = function(){
					let params=window.speechSynthesis.params;
					wacss.speak(params.txt,params);
				};
			}
		}
		else{
			console.log('wacss.speak error: speechSynthesis is not supported in your browser or OS');
		}
		return false;
	},
	str_replace: function(search, replace, str) {
	    let f = search;
	    let r = replace;
	    let s = str;
	    let ra = r instanceof Array;
	    let sa = s instanceof Array;
	    f = [].concat(f);
	    r = [].concat(r);
	    let i = (s = [].concat(s)).length;

	    while (j = 0, i--) {
	        if (s[i]) {
	            while (s[i] = s[i].split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f){};
	        }
	    };

	    return sa ? s : s[0];
	},
	strtolower: function(str) {
	    // info: Makes a string lowercase
	    //source: http://phpjs.org/functions
	    return (str + '').toLowerCase();
	},
	strtoupper: function(str) {
	    // info: Makes a string uppercase
	    //source: http://phpjs.org/functions
	    return (str + '').toUpperCase();
	},
	toast: function(msg,params){
		if(undefined == params){
			params={color:'w_red',timer:3};
		}
		if(undefined == params.color){
			params.color=wacss.color();
		}
		if(undefined == params.timer){params.timer=3000;}
		else{params.timer=parseInt(params.timer)*1000;}
		if(undefined == document.getElementById('wacss_toasts')){
			let ts = document.createElement('div');	
			ts.id='wacss_toasts';
			document.body.appendChild(ts);
		}
		
		let t = document.createElement('div');
		t.className='toast '+params.color;
		t.setAttribute('role','alert');
		t.innerHTML=msg;
		t.style.position='relative';
		t.timer=params.timer;
		//close button
		let c = document.createElement('span');
		c.className='icon-close';
		c.pnode=t;
		c.title='Close';
		c.onclick=function(){
			wacss.removeObj(this.pnode);
		};
		t.appendChild(c);
		document.getElementById('wacss_toasts').appendChild(t);
		//console.log('timer',params);
		setTimeout(function(){
			wacss.dismiss(t);
			},params.timer
		);
	},
	toggleClass: function(id,class1,class2,myid,myclass1,myclass2){
		let obj=wacss.getObject(id);
		if(undefined == obj){return;}
		if(obj.className.indexOf(class1) != -1){
	    	wacss.removeClass(obj,class1);
	    	wacss.addClass(obj,class2);
		}
		else if(obj.className.indexOf(class2) != -1){
	    	wacss.removeClass(obj,class2);
	    	wacss.addClass(obj,class1);
		}
		else{wacss.addClass(obj,class1);}
		//a second set may be set to also modify the caller
		if(undefined != myid){
			obj=wacss.getObject(myid);
			if(undefined == obj){return;}
			if(obj.className.indexOf(myclass1) != -1){
		    	wacss.removeClass(obj,myclass1);
		    	wacss.addClass(obj,myclass2);
			}
			else if(obj.className.indexOf(myclass2) != -1){
		    	wacss.removeClass(obj,myclass2);
		    	wacss.addClass(obj,myclass1);
			}
			else{wacss.addClass(obj,myclass1);}
		}
	},
	trim: function(str){
		if (null != str && undefined != str && "" != str){
			let rval=str.replace(/^[\ \s\0\r\n\t]*/g,"");
			rval=rval.replace(/[\ \s\0\r\n\t]*$/g,"");
		    return rval;
			}
		else{return "";}
	},
	ucfirst: function(str) {
	    //info: Makes a string's first character uppercase
	    //source: http://phpjs.org/functions
	    let f = str.charAt(0).toUpperCase();
	    return f + str.substr(1);
	},
	ucwords: function(str){
		str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
		    return letter.toUpperCase();
		});
		return str;
	},
	urlEncode: function(str) {
		//info: URL encode string
		//usage: $encoded=urlEncode('address=122 east way');
		str=str+'';
		str=str.replace(/\//g,"%2F");
		str=str.replace(/\?/g,"%3F");
		str=str.replace(/\</g,"%3C");
		str=str.replace(/\>/g,"%3E");
		str=str.replace(/\"/g,"%22");
		str=str.replace(/=/g,"%3D");
		str=str.replace(/&/g,"%26");
		str=str.replace(/\#/g,"%23");
		//str=str.replace(/\s/g,"+");
	    return str;
	},
	wacsseditHandleFiles(el){
		for(let f=0;f<el.files.length;f++){
			let reader = new FileReader();
			reader.filebox=el.filebox;
			reader.filename=el.files[f].name;
			reader.filesize=el.files[f].size;
			reader.filetype=el.files[f].type;
		    reader.onload = function(){
		    	if(this.filetype.toLowerCase().indexOf('image') == 0){
		    		let dataURL = this.result;
			      	let img = document.createElement('img');
			      	img.src = dataURL;
			      	img.style.width='32px';
			      	img.style.height='32px';
			      	img.style.margin='5px';
			      	img.title=this.filename;
			      	this.filebox.appendChild(img);	
		    	}
		    	else if(this.filetype.toLowerCase().indexOf('audio') == 0){
		    		let dataURL = this.result;
			      	let aud = document.createElement('audio');
			      	aud.src = dataURL;
			      	aud.controls = true;
			      	aud.title=this.filename;
			      	aud.style.maxHeight='100px';
			      	aud.style.maxWidth='150px';
			      	this.filebox.appendChild(aud);	
		    	}
		    	else if(this.filetype.toLowerCase().indexOf('video') == 0){
		    		let dataURL = this.result;
			      	let vid = document.createElement('video');
			      	vid.src = dataURL;
			      	vid.controls = true;
			      	vid.title=this.filename;
			      	vid.style.maxHeight='100px';
			      	vid.style.maxWidth='150px';
			      	this.filebox.appendChild(vid);	
		    	}
		    	
		    };
		    reader.readAsDataURL(el.files[f]);
		}
	}
}
wacss.listen('load',window,function(){wacss.init();});