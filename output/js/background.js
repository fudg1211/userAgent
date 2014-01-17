var uaValue,uaType;

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
