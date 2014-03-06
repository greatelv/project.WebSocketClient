/**
 * main scene 
 */
scene.main = function() {
	var _this = $scene.create('main', jQuery('#scene_main'));
	
	var _elem = {
		navi: 		jQuery('#navi'),
		pointer : 	jQuery('#pointer'),
		state : 	_this.elem.find('.state span'),
		log : 		_this.elem.find('.log-container > ul')
	};
	
	var _handler = {
		scene: _this.elem.find('> a.handler.scene')
	};

	var socketInstanceOne = null;
	var socketInstanceTwo = null;



	
	/*var render =	function(e)	{
		_elem.pointer.css({
			top : e.clientY+'px',
			left : e.clientX+'px'
		})
	};*/
	var initSocketOptions = function(){

		socketInstanceOne = new $hz.device.socket();
		socketInstanceTwo = new $hz.device.socket();

		socketInstanceOne.setOption({
			url : '192.168.11.43:8887',
			onReceive : function(message){
				var rs = message;


				_elem.log.children('li.pointer-1').text('['+rs.type+'] '+rs.val);
				
				var message_ = rs.val.toString();
				var divider_index = message_.indexOf(',');
				var x = message_.substr(0, divider_index);
				var y = message_.substr(divider_index+1, message_.length);

				LOG('x:'+x+'/y:'+y);
				
				document.getElementById("pointer_one").style.top = y+'px';
				document.getElementById("pointer_one").style.left = x+'px';

			},
			onOpen : function(){
				LOG('###############################ON ONPEN :: ');
				_elem.state.text('Open');
				$hz.device.socketUtil.registerInstance(socketInstanceOne);
			},
			onClose : function(isForcedClose){	//강제 종료냐 아니냐 false면 정상 종료 
				_elem.state.text('Close');
			}
		});




		socketInstanceTwo.setOption({
			url : '192.168.11.11:8887',
			onReceive : function(message){
				var rs = message;

				_elem.log.children('li.pointer-2').text('['+rs.type+'] '+rs.val);
				
				var message_ = rs.val.toString();
				var divider_index = message_.indexOf(',');
				var x = message_.substr(0, divider_index);
				var y = message_.substr(divider_index+1, message_.length);

				LOG('x:'+x+'/y:'+y);

				document.getElementById("pointer_two").style.top = y+'px';
				document.getElementById("pointer_two").style.left = x+'px';

			},
			onOpen : function(){
				_elem.state.text('Open');
				$hz.device.socketUtil.registerInstance(socketInstanceTwo);
			},
			onClose : function(isForcedClose){	//강제 종료냐 아니냐 false면 정상 종료 
				_elem.state.text('Close');
			}
		});
	};
	
	_this.init = function() {
		var oDefaultCallback = {
			'return': function() {
				$loader.exit();
			}
		};

		$hz.event.bind(_handler.scene, jQuery.extend({}, oDefaultCallback, {
			'info' : function(){
			},
			'up' : function(){
				$hz.device.socketUtil.closeAll();
			},
			'down' : function(){
				$hz.device.socketUtil.broadcastMessage('down!!!');
			},
			'right' : function(){
				socketInstanceOne.send('right !@!!!!!!!!');
			},
			'left' : function(){
				socketInstanceOne.send('left !@!!!!!!!!!!');
			},
			'enter' : function(){
				LOG('socketInstanceOne.getState() : '+socketInstanceOne.getState());
				LOG('socketInstanceTwo.getState() : '+socketInstanceTwo.getState());
			},
			'red'	: function(){
				socketInstanceOne.open();
				socketInstanceTwo.open();
			},
			'green' : function(){
				socketInstanceOne.close();	
				socketInstanceTwo.close();
			},
			'yellow' : function(){
				if(_logFlag){
					_logFlag = false;
				}else{
					_logFlag = true;
				}
			},
			'blue' : function(){
				$hz.device.socketUtil.removeInstance(socketInstanceTwo.getDeviceId());
			}
		}));

		_this.init = function() {};
	};
	
	_this.focus = function() {
		$scene.focus(_handler.scene);
	};
	
	_this.onShow = function() {
		_this.updateNavi();
	};
	
	_this.onHide = function() {
	};

	_this.updateNavi = function() {
		$hz.ui.updateNavi({
			'return': '[네비]복귀'
		}, _elem.navi);
	};
	
	_this.load = function(onUnload, onLoad) {
		
		_this.parent.load(onUnload, onLoad);

		initSocketOptions();

		
	}
	return _this;
}();