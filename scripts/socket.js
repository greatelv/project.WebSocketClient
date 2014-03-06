/**
 * Multi Websocket Client
 * By tkjeon wjswjs2@gmail.com
 * @return {[type]} [description]
 */
var WebSocket = function(){

	var _serverAddr = 'echo.websocket.org';	//Base Echo Server
	var _websocket = {};	//websoctet local instance

	var STATE = {
		'0' : 'connecting',
		'1'	: 'open',
		'2' : 'closing',
		'3' : 'closed'
	};
	
	_websocket.readyState = 3;	// default status

	//param format
	var _param = jQuery.extend({}, {
		val : '',
		type : '',
		ext : {
			id : ''
		}	
	});

	var _device = {};
	var _registerDevice = function(device){
		_device = device;
	}

	

	var _opts = {};

	return {
		/**
		* init options for instance
		* @param opts - 초기화에 필요한 옵션 객체 리터럴 / url, port, callbacks
		**/
		setOption: function(opts){
			_opts && delete _opts;

			_opts = jQuery.extend({
				url : _serverAddr,	//포트까지 포함한 URL
				onOpen: function(){},
				onClose: function(){},
				onReceive: function(msg){
					LOG('Success : Receive msg to server - '+JSON.stringify(msg));
				},
				onSend: function(msg){
					LOG('Success : Send msg to server - '+msg);
				},
				onError: function(){}
			}, opts);
		},

		/**
		 * 웹소켓 인스턴스 초기화 및 연결
		 * @return
		 */
		open: function(){
			if(this.getState() != 'closed'){
				return false;
			}

			if (window.MozWebSocket) {
				LOG('Error : This browser supports WebSocket using the MozWebSocket constructor');
				window.WebSocket = window.MozWebSocket;
			} else if (!window.WebSocket) {
				LOG('Error : This browser does not have support for WebSocket');
				return;
			}

			try{
				var url = 'ws://'+_opts.url;
				_websocket = new WebSocket(url);

				_websocket.onopen = function(msg) {
					LOG('Success : Socket Open [JSON.stringify(msg)] - ' + JSON.stringify(msg));

				};
				_websocket.onclose = function(msg) {
					_opts.onClose();
					LOG('Success : Socket Close [JSON.stringify(msg)] - ' + JSON.stringify(msg));
				};	
				_websocket.onmessage = function(msg) {
					LOG('Success : Message Receive [JSON.stringify(msg)] - ' + JSON.stringify(msg));
					var msg = jQuery.extend(_param, JSON.parse(msg.data));

					if(msg.type=='protocol' && msg.val=='connect'){
						_device = msg.ext;
						_opts.onOpen();
					}

					_opts.onReceive(msg);
				};
				_websocket.onerror = function(msg) {
					LOG('Error : Socket Error' + msg);

					var msg = jQuery.extend(_param, JSON.parse(msg.data));
					_opts.onError(msg);
				};

			}catch(e){
				LOG('Error : WebSocket Exception :[' +e.code + '] ' + e.msg);
			}
		},

		close: function(){
			if(this.getState() == 'closed'){
				return false;
			}
			_websocket.close();
		},

		/**
		 * 웹소켓 인스턴스에서 서버로 메세지 전송
		 * @param  {Object} msg [웹소켓 서버로 전송할 데이터]
		 * @param  {function} onSend  [정의한다면 init 함수에서 정의한 콜백을 extend]
		 */
		send: function(msg, onSend){
			if(this.getState() != 'open' ){
				return false;
			}
			//var msg = jQuery.extend(_param, msg);
			var sendCallback = jQuery.extend(_opts.onSend, onSend);

			_websocket.send(msg);	
			sendCallback(msg);
		},

		/**
		 * onReceive 콜백 재설정
		 * @param  {function} onReceive [재설정 할 콜백 함수]
		 */
		resetOnReceive : function(onReceive){
			_websocket.onmsg = function(msg) {
				onReceive(msg.data);
			};
		},

		getDeviceId : function(){
			return _device.id;
		},

		getDeviceInfo : function(){
			return _device;
		},

		/**
		 * 웹소켓 인스턴스의 현재 상태 반환
		 * @return {Integer} [1 - CONNECTING, 2 - OPEN, 3 - CLOSING, 4 - CLOSED]
		 */
		getStateCode : function(){
			return _websocket.readyState;
		},

		getState : function(){
			return STATE[this.getStateCode()];	
		}
	}

};

/**
 * 여러개의 소켓 인스턴스를 관리하는 유틸 라이브러리
 * @type {Object}
 */
var SocketUtil = {
	
	_instanceCollection: {},

	//Open 상태에서 등록할 수 있음
	registerInstance : function(instance){
		var _this = SocketUtil;
		
		if(!instance || instance.getState() != 'open'){
			return false;
		}
		
		var key = instance.getDeviceId();
		_this._instanceCollection[key] = instance;

		
	},
	//콜렉션에 등록된 인스턴스 모두에게 메세지 전달
	broadcastMessage : function(msg){

		var _this = SocketUtil;
		msg = msg ? msg : '';

		for(key in _this._instanceCollection){
			_this._instanceCollection[key].send(msg);
		}
	},
	/**
	 * [closeAll description]
	 * @return {[type]} [description]
	 */
	closeAll : function(){
		var _this = SocketUtil;

		for(key in _this._instanceCollection){
			_this._instanceCollection[key].close();
		}
	},

	/**
	 * [openAll 등록된 인스턴스 모두 연결]
	 * @return {[type]} [description]
	 */
	openAll : function(){
		var _this = SocketUtil;

		for(key in _this._instanceCollection){
			_this._instanceCollection[key].open();
		}
	},

	/**
	 * [clearCollection 콜렉션을 초기화]
	 * @return {[type]} [description]
	 */
	clearCollection : function(){
		_instanceCollection: {};
	},

	/**
	 * [removeInstance 인스턴스 키(deviceId)를 이용해 임의의 인스턴스 제거]
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
	removeInstance : function(id){
		if(!id){
			return false;
		}

		var _this = SocketUtil;
		_this._instanceCollection[id] && delete _this._instanceCollection[id];
	}
};