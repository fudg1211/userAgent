/**
 * Created with IntelliJ IDEA.
 * User: fudongguang
 * Date: 13-8-30
 * Time: PM2:04
 * To change this template use File | Settings | File Templates.
 */


define(['./common'],function(com){
	var data = [
		['Default',''],
		['iPhone','Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3'],
		['iPad','Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3'],
		['Android','Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19'],
		['WinPhone','Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)'],
		['Chrome','Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36'],
		['Firefox','Mozilla/5.0 (Windows NT 6.2; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0'],
		['Safari','Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-US) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27'],
		['IE6','Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.2)'],
		['IE7','Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'],
		['IE8','Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)'],
		['IE9','Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)'],
		['IE10','Mozilla/5.0 (compatible; WOW64; MSIE 10.0; Windows NT 6.2)']
	];


	/**
	 * 保留用户数据到新的数据格式
	 */

		var a = JSON.parse(com.storage.local.get('customData'));

		if (a && a.hasOwnProperty('Default')) {


			for (k in a) {

				if (k === 'Default') {
					continue;
				}

				var check = false;

				for (var i = 0; i < data.length; i++) {
					if (k === data[i][0]) {
						check = true;
						data[i][1] = a[k];
						break;
					}
				}

				if (!check) {
					var arr = [k, a[k]];
					data.push(arr);
				}
			}

			com.storage.local.removeAll();
		}

	var customData = com.storage.local.get('customData');

	if(customData){
		customData = JSON.parse(customData);
		return customData;
	}else{
		com.storage.local.set('customData',JSON.stringify(data));
		return data;
	}
});



