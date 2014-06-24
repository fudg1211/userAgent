var uaValue,uaType;

chrome.browserAction.setIcon({path: "images/icons/icon-48.png"});

(function(){
	if(chrome.app){
		var lastTime = window.localStorage.getItem('lastTime'),msg;

		if((lastTime+20*24*3600*1000)<new Date().getTime()){
			msg = 'userAgent 更新成功，感谢您的使用。';
		}

		if(!lastTime){
			msg = 'userAgent 安装成功，感谢您的使用。';
		}

		window.localStorage.setItem('lastTime',new Date().getTime());

		if(msg){
			chrome.tabs.create({url:'http://miliguli.com?type=ua&msg='+encodeURIComponent(msg)});
		}
	}
}());


chrome.webRequest.onBeforeSendHeaders.addListener(
	function (details) {
		if(uaValue){
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'User-Agent') {
					details.requestHeaders[i].value = uaValue;
					break;
				}
			}
			return {requestHeaders: details.requestHeaders};
		}
	},
	{urls: ["<all_urls>"]},
	["blocking", "requestHeaders"]
);

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.hasOwnProperty('uaValue')){
		uaValue = message['uaValue'];
		uaType = message['uaType'];
	}

	sendResponse({userAgent:uaValue});
});
