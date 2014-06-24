/**
 * Created with IntelliJ IDEA.
 * User: fudongguang
 * Date: 2013/08/16
 * Time: 07:35 PM
 * To change this template use File | Settings | File Templates.
 */

define(['./global/common', './global/data'], function (com,customData) {
	var IndexController = FishMvc.View.extend({
		init: function () {
			this.startApp();
			setTimeout(function(){
				$('#comments').animate({opacity:0},1000,undefined,function(){
					$('#comments').remove();
				});
			},3000);
		},

		elements: {
			'.J-setUserAgent': 'setUserAgent_rel',
			'#Default':'Default',
			'.orangeButton':'orangeButton_rel',
			'#list':'list',
			'#add':'add',
			'#del':'del',
			'.addSetDiv':'addSetDiv',
			'#addUaSubmit':'addUaSubmit_rel',
			'#addUaName':'addUaName_rel',
			'#addUaValue':'addUaValue_rel',
			'#uaId':'uaId_rel',
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
			'click del':'doDel',
//			'click dragstart':'dragstart',
			'click delItem_rel':'doDelItem'
		},

		/**
		 * app初始设置
		 */
		startApp: function () {
			var data= customData.getData();
			this.editNum=false;
			this.doStatus=null;

			var html = '',text,textA;
			for(var i=0;i<data.length;i++){
				text = data[i][1];
				textA = 'ua_'+ data[i][0].toString();
				html+='<div class="setUserAgentDiv J-setUserAgentDiv"><button class="m-button J-setUserAgent" id="'+textA+'"  val="'+data[i][2]+'">'+text+'</button></div>';
			}

			this['list'].html(html);

			this.backgroundPage = chrome.extension.getBackgroundPage();
			var uaType = this.backgroundPage.uaType;


			if(!uaType){
				uaType='ua_1';
			}

			this['add'].prop('disabled',false);
			this['edit'].prop('disabled',false);
			this['del'].prop('disabled',false);
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
			var type = $(obj[0]).attr('id');
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

			if (lastType === type || (!lastType && type==='ua_1')) {
				return false;
			}

			if (type === 'ua_1' || !type) {
				chrome.browserAction.setIcon({path: "images/icons/icon-48.png"})
			} else {
				chrome.browserAction.setIcon({path: "images/icons/icon-48-1.png"})
			}

			var filterId = this.filterType(type);
			if(filterId){
				var data = customData.getById(filterId);
				this.sendMessageToBg(data[2],type);
			}

			return true;
		},

		/**
		 * 过滤type id
		 * @param type
		 * @returns {*}
		 */
		filterType:function(type){
			if(isNaN(parseInt(type))){
				if(/^ua_/i.test(type)){
					return parseInt(type.replace(/ua_/i,''));
				}else{
					return false;
				}

			}else{
				return parseInt(type);
			}
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
			if(type==='au_1'){
				chrome.browserAction.setIcon({path: "images/icons/icon-48.png"});
			}
		},

		doDel:function(){

			if(this.doStatus==='del'){
				this.doStatus=null;
				this.startApp();
				return false;
			}

			this['edit'].prop('disabled',true);
			this['add'].prop('disabled',true);

			this.doStatus='del';
			var uaType = this.backgroundPage.uaType;
			var str='<span class="delItem closeItem"></span>';
			this['JsetUserAgentDiv_rel']().each(function(){
				var obj = $(this).children().eq(0),itemName = obj.parent().text().trim(),itemType = obj.attr('id');

				$(this).children('button').attr('disabled',true).css({color:'#ccc',cursor:'default'});
				if(itemName!=='Default' && itemType!==uaType){
					$(this).append(str);
				}
			});
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

			var uaId = this['uaId_rel']().val();

			if(uaId){
				uaId = this.filterType(uaId);

				var a = customData.getByName(name)
				if(a && a[0]!==parseInt(uaId)){
					com.showTip('<span class="error">'+com._i18n('msg_nameAlready')+'</span>');
					return false;
				}

				customData.updateById(uaId,name,value);
			}else{
				if(customData.getByName(name)){
					com.showTip('<span class="error">'+com._i18n('msg_nameAlready')+'</span>');
					return false;
				}

				customData.add(name,value);
			}


			$(this.doAddDialog).remove();
			var status = this.doStatus;

			this.startApp();
			if(status==='edit'){
				this.doEdit();
			}

			com.showTip(com._i18n('msg_success'));
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
						self.backgroundPage.uaType='ua_1';
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
			this['del'].prop('disabled',true);

			var uaType = this.backgroundPage.uaType;

			this.doStatus='edit';

			this['JsetUserAgentDiv_rel']().addClass('editing');

			com.showTip(com._i18n('msg_editNoticeA')+'<br/> '+com._i18n('msg_editNoticeB'),6000)
		},

		doEditItem:function(obj){
			var name = obj.text(),val = obj.attr('val'),uaId =obj.attr('id') ,self = this;

			if(name==='Default'){
				return false;
			}

			this.doAdd();

			setTimeout(function(){
				self['addUaName_rel']().val(name);
				self['addUaValue_rel']().val(val);
				self['uaId_rel']().val(uaId);
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
			if(this.doStatus!=='del'){
				return false;
			}

			var id = $(obj).prev().attr('id');

			if(id==='ua_1' || !id){
				return false;
			}

			id = this.filterType(id);
			customData.delById(id);

			this.startApp();
			this.doDel();

			return false;
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
