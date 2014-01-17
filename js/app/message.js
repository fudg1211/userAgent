/**
 * Created with IntelliJ IDEA.
 * User: fudongguang
 * Date: 2013/08/16
 * Time: 07:35 PM
 * To change this template use File | Settings | File Templates.
 */

define(['./global/common', './global/data'], function (com, data) {
	var MessageController = FishMvc.View.extend({

	});

	var messageController = new MessageController({el: $('#wrapper')});
	com.gather['messageController'] = messageController;

});
