/**
 * Created with IntelliJ IDEA.
 * User: fudongguang
 * Date: 2013/08/16
 * Time: 07:35 PM
 * To change this template use File | Settings | File Templates.
 */

define(['./global/common', './global/data'], function (com) {
	var IndexController = FishMvc.View.extend({
		init: function () {
			this.startApp();
		},

		elements: {
			'.J-setUserAgent': 'setUserAgent_rel',
			'#Default':'Default',
			'.orangeButton':'orangeButton_rel',
			'#list':'list',
			'#add':'add',
			'.addSetDiv':'addSetDiv',
			'#addUaSubmit':'addUaSubmit_rel',
			'#addUaName':'addUaName_rel',
			'#addUaValue':'addUaValue_rel',
			'#reset':'reset',
			'#edit':'edit',
			'.J-setUserAgentDiv':'JsetUserAgentDiv_rel',
			'.delItem':'delItem_rel'
		},

		events: {
			'click setUserAgent_rel': 'doSetUserAgent',
			'click add':'doAdd',
			'click addUaSubmit_rel':'doAddUaSubmit',
			'click reset':'doResetData',
			'click edit':'doEdit',
//			'click dragstart':'dragstart',
			'click delItem_rel':'doDelItem'
		},

		/**
		 * app初始设置
		 */
		startApp: function () {
			var data= JSON.parse(com.storage.local.get('customData'));
			this.data = data;
			this.editNum=false;
			this.doStatus=null;

			var html = '',text;
			for(var i=0;i<data.length;i++){
				text = data[i][0];
				html+='<div class="setUserAgentDiv J-setUserAgentDiv"><button class="m-button J-setUserAgent" id="'+text+'" num="'+i+'" val="'+data[i][1]+'">'+text+'</button></div>';
			}

			this['list'].html(html);

			this.backgroundPage = chrome.extension.getBackgroundPage();
			var uaType = this.backgroundPage.uaType;

			if(!uaType){
				uaType='Default';
			}

			this['add'].prop('disabled',false);
			this.changeType(uaType);
		},

		/**
		 * 点击设置用户名
		 * @param obj
		 */
		doSetUserAgent: function (obj) {
			obj = $(obj);

			if(this.doStatus==='edit'){
				this.doEditItem(obj);
			}else{
				this.doSetUserAgentNext(obj)
			}
		},


		doSetUserAgentNext:function(obj){
			var type = obj.text();
			if(this.setUserAgentByType(type)){
				this.changeType(type);

				chrome.tabs.getSelected(function(){
					var url=arguments[0]['url'];

					if(!/^chrome:/i.test(url)){
						chrome.tabs.reload();
					}else{
						com.showTip(com._i18n('msg_success'));
					}
				});
			}
		},

		/**
		 * 通过用户名设置userAgent
		 * @param obj
		 */
		setUserAgentByType: function (type) {
			var lastType = this.backgroundPage.uaType;

			if (lastType === type || (!lastType && type==='Default')) {
				return false;
			}

			if (type === 'Default' || !type) {
				chrome.browserAction.setIcon({path: "images/icons/icon-48.png"})
			} else {
				chrome.browserAction.setIcon({path: "images/icons/icon-48-1.png"})
			}


			if (this.checkDataItem(type)) {
				var data = this.getRowByItem(type);
				this.sendMessageToBg(data[1],type);
			}

			return true;
		},

		/**
		 * 向bg发送消息
		 */
		sendMessageToBg:function(value,type){
			var config = {
				uaValue:value,
				uaType:type
			};

			chrome.runtime.sendMessage(config,function(){
			})
		},

		/**
		 * 改变ua
		 * @param type
		 */
		changeType:function(type){
			this['orangeButton_rel']().removeClass('orangeButton').prop('disabled',false);
			$('#'+type).addClass('orangeButton').prop('disabled',true);
		},


		/**
		 * 自定义添加ua
		 * @returns {boolean}
		 */
		doAdd:function(){
			var config={
				url:'add',
				className:'addSetDiv'
			};
			this.doAddDialog = dialog(config);
			return false;
		},

		/**
		 * 添加提交
		 * @returns {boolean}
		 */
		doAddUaSubmit:function(){
			var name = this['addUaName_rel']().val().trim();
			if(!name){
				this['addUaName'].attr('placeholder',com._i18n('msg_setName')).focus();
				return false;
			}

			if(name.toLowerCase()==='default'){
				this['addUaName'].attr('placeholder',com._i18n('msg_noDefault')).focus();
				return;
			}


			var value = this['addUaValue_rel']().val().trim();
			if(!value){
				this['addUaValue'].attr('placeholder',com._i18n('msg_setValue')).focus();
				return false;
			}

			if(this.saveData(name,value)){
				$(this.doAddDialog).remove();
				var status = this.doStatus;

				this.startApp();
				if(status==='edit'){
					this.doEdit();
				}

				com.showTip(com._i18n('msg_success'));
			}

			return false;
		},

		/**
		 * 保存数据
		 */
		saveData:function(item,value){
			var obj,i= 0,data = this.data,check=false;

			if(item==='Default' || !item){
				return false;
			}

			if(this.editNum){

				for(;i<data.length;i++){
					if(data[i][0]===item && i!==this.editNum){
						check=true;
						break;
					}
				}

				if(check){
					com.showTip('<span class="error">'+com._i18n('msg_nameAlready')+'</span>');
					return false;
				}

				data[this.editNum]=[item,value,1,new Date().getTime()];
				this['setUserAgent_rel']().eq(this.editNum).attr('id',item).text(item);
				this.editNum=false;
			}else{

				for(;i<data.length;i++){
					if(data[i][0]===item){
						check=true;
						break;
					}
				}

				if(check){
					com.showTip('<span class="error">'+com._i18n('msg_nameAlready')+'</span>');
					return false;
				}

				obj = [item,value];
				data.push(obj);
			}

			com.storage.local.set('customData',JSON.stringify(data));

			return true;
		},

		/**
		 * 重置数据
		 */
		doResetData:function(){
			var self = this;
			var config={
				className:'doResetData',
				buttons:[
					[com._i18n('msg_yes')],[com._i18n('msg_no'),'J-dialogClose']
				],
				funs:[
					function(){
						com.storage.local.remove('customData');
						self.backgroundPage.uaType='Default';
						chrome.browserAction.setIcon({path: "images/icons/icon-48.png"});
						setTimeout(function(){
							window.location.reload();
						},100);
					}
				]
			};
			com.alert('<span class="center">'+com._i18n('msg_resetNiceA')+'<br/>'+com._i18n('msg_resetNiceB')+'</span>',config);
			return false;
		},

		/**
		 * 全部编辑
		 */
		doEdit:function(){
			if(this.doStatus==='edit'){
				this.doStatus=null;
				this.startApp();
				return false;
			}

			this['add'].prop('disabled',true);

			var uaType = this.backgroundPage.uaType;

			this.doStatus='edit';
			var str='<span class="delItem closeItem"></span>'
			this['JsetUserAgentDiv_rel']().each(function(){
				var obj = $(this),itemName = obj.text().trim();

				if(itemName!=='Default' && itemName!==uaType){
					$(this).append(str);
				}
			});

			com.showTip(com._i18n('msg_editNoticeA')+'<br/> '+com._i18n('msg_editNoticeB'),6000)
		},

		doEditItem:function(obj){
			var name = obj.text(),val = obj.attr('val'),self = this;
			this.editNum = parseInt(obj.attr('num'));

			if(name==='Default'){
				return false;
			}

			this.doAdd();

			setTimeout(function(){
				self['addUaName_rel']().val(name);
				self['addUaValue_rel']().val(val);
			},100);
		},

		doDelItem:function(obj){
			var self = this;
			var config={
				className:'doResetData',
				buttons:[
					[com._i18n('msg_yes'),'J-dialogClose'],[com._i18n('msg_no'),'J-dialogClose']
				],
				funs:[
					function(){
						self.doDelItemSubmit(obj);
					}
				]
			};
			com.alert('<span class="center">'+com._i18n('msg_delNotice'),config);
		},

		doDelItemSubmit:function(obj){
			if(this.doStatus!=='edit'){
				return false;
			}

			obj = $(obj).parent();
			var a = obj.text();

			if(a==='Default' || !a){
				return false;
			}

			var customData = this.data;

			var k=customData.length;
			for(var i=0;i<customData.length;i++){
				if(customData[i][0]===a){
					k = i;
					break;
				}
			}

			customData.splice(k,1);

			com.storage.local.set('customData',JSON.stringify(customData));

			this.startApp();
			this.doEdit();

			return false;
		},

		getRowByItem:function(item){
			var customData = this.data,result;

			for(var i=0;i<customData.length;i++){
				if(customData[i][0]===item){
					result=customData[i];
					break;
				}
			}

			return result;
		},

		/**
		 * 核对数据
		 */
		checkDataItem:function(item){
			var customData = this.data,check=false;

			for(var i=0;i<customData.length;i++){
				if(customData[i][0]===item){
					check=true;
					break;
				}
			}

			return check;
		}
	});

	var indexController = new IndexController({el: $('#body')});
	com.gather['indexController'] = indexController;


});
