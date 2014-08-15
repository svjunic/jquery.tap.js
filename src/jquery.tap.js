/**
 * Copyright 2014, sv.junic@gmail.com
 * The MIT License (MIT)
 */
(function( window, document, $ ) {

  "use strict";

  /**
   * カスタムデータの名前を保存するオブジェクト
   *
   * @type object
   * @private
   * */
  var DATA = {};

  /**
   * カスタムデータ DATA.EVENT_NAME 
   *
   * カンマ区切りでイベント名を保存する。
   * 同名のイベントを登録しようとした場合は追加されず、エラーとなる
   *
   * @type string
   * @private
   * */
  DATA.EVENT_NAME     = 'eventName';

  /**
   * カスタムデータ DATA.IS_TOUCHED
   *
   * touchstartが発生したか、していないかのフラグを保存する
   *
   * true  : touchstartが発生した
   * false : touchstartが発生していない
   *
   * @type string（jqueryでboolean）
   * @private
   * */
  DATA.IS_TOUCHED     = 'isToudched';

  /**
   * カスタムデータ DATA.IS_TOUCH_MOVED
   *
   * touchstart後にtouchmoveが発生したか、していないかのフラグを保存する
   *
   * true  : touchmoveが発生した
   * false : touchmoveが発生していない
   *
   * @type string（jqueryでboolean）
   * @private
   * */
  DATA.IS_TOUCH_MOVED = 'isToudchMoved';

  /**
   * カスタムデータ DATA.TIMESTAMP
   *
   * touchstartが発生した際のタイムスタンプを保存する
   * このタイムスタンプは、長押し（log tap）時のキャンセル比較に使用
   *
   * @type string（jqueryでnumber）
   * @private
   * */
  DATA.TIMESTAMP      = 'touchstartTimestamp';

  /**
   * デフォルトのイベント
   *
   * @type string（jqueryでnumber）
   * @private
   * */
  var DefaultEventName     = 'tap';

  /**
   * 長押しタップの判定に用いる時間
   *
   * @type {number} Milliseconds
   * @private
   * */
  var LongTapTime          = 500;

  /**
   * 使用できないイベント名判定用のRegオブジェクト
   *
   * @type {object} Reg
   * @private
   * */
  var RegDontUseEventNames = /^(blur|focus|change|select|selectstart|submit|reset|abort|error|load|unload|click|dblclick|keyup|keydown|keypress|mouseout|mouseover|mouseup|mousedown|mousemove|dragdrop|touchstart|touchmove|touchend)/;

  /**
   * ネームスペースイベントの判定用
   * TODO 仕様によっては変更あるかも。
   *
   * @type {object} Reg
   * @private
   * */
  var RegEventNameSpace    = /^[a-zZ-Z0-9]*\.[a-zZ-Z0-9]*$/;


  /**
   * jQuery.fn.listenTap
   *
   * @type {jQuery.Function}
   * @method listenTap
   * */
  $.fn.listenTap = function ( originalEventName ) {

    var eventName;

    // イベント名の確認
    if( typeof originalEventName !== 'string' ) {
      eventName = DefaultEventName;
    } else {
      if( originalEventName === '' ) {
        throw '[ jquery.tap ] Invalid eventName.';
      }
      if( RegDontUseEventNames.test( originalEventName ) ) {
        throw '[ jquery.tap ] Invalid eventName.';
      }
      eventName = originalEventName;
    }

    var $this = $(this);

    // イベントが既に登録されていないか確認
    var events, eventsString;

    eventsString = $this.data( DATA.EVENT_NAME );

    try {
      if( typeof eventsString === 'string' ) {
        events = eventsString.split(',');
        if( events.indexOf( eventName ) !== -1 ) {
          throw 'The event has already been registered.';
        }
      }

      _addTapEventListener( $this, eventName );
    } catch(e) {
      console.error( e );
    }

    return $this;
  };

  /**
   * jQuery.fn.listenTapDestroy
   *
   * @type {jQuery.Function}
   * @method listenTap
   * */
  $.fn.listenTapDestroy = function ( _eventName ) {

    var removeEventName = _eventName || DefaultEventName;

    var $this = $(this);

    try {
      _removeTapEventListener( $this, removeEventName );
    } catch(e) {
      console.error( e );
    }

    return $this;
  };


  /**
   * _addTapEventListener
   *
   * @return $(this)
   */
  function _addTapEventListener( $this, eventName ) {
    // イベントを追加
    var events, eventsString;

    eventsString = $this.data( DATA.EVENT_NAME );

    if( typeof eventsString === 'undefined' ){
      events = [];
      events.push(eventName);

      // add evnetlistener
      $this.on( 'touchstart touchmove touchend', _onTouchEventListener);
      $this.on( 'click'                        , _onClickListener );
    } else {
      events = $this.data(DATA.EVENT_NAME).split(',');
      events.push(eventName);
    }

    eventsString = events.join(',');
    $this.data( DATA.EVENT_NAME, eventsString );

 

    return $this;
  }

  /**
   * _removeTapEventListener
   *
   * @return $(this)
   */
  function _removeTapEventListener( $this, removeEventName ) {

    // 登録されているイベントの中から、対象のイベント発火を削除
    var eventString = $this.data( DATA.EVENT_NAME );
    var events = eventString.split(',');
    var removeIndex = events.indexOf( removeEventName );

    if( removeIndex === -1 ) {
      throw 'This event has not been registered.';
    }

    events.splice( removeIndex, 1 );

    if( events.length === 0 ) {
      // 指定されているイベントがもうない場合
      $this.removeData( DATA.EVENT_NAME );

      // remove custom data
      $this.removeData( DATA.IS_TOUCHED );
      $this.removeData( DATA.IS_TOUCH_MOVED );
      $this.removeData( DATA.TIMESTAMP );
      
      // remove evnetlistener
      $this.off( 'touchstart touchmove touchend', _onTouchEventListener);
      $this.off( 'click'                        , _onClickListener );
    } else {
      // 指定されているイベントがまだある場合
      $this.data( DATA.EVENT_NAME, events.join(',') );
    }

    return $this;
  }

  function _onTouchEventListener ( e ) {

    var $target = $( e.target );
    var $currentTarget = $( e.currentTarget );

    if( e.type === 'touchstart' ) {
      $currentTarget.data( DATA.IS_TOUCHED    , true );
      $currentTarget.data( DATA.IS_TOUCH_MOVED, false );
      $currentTarget.data( DATA.TIMESTAMP     , e.timeStamp );
      return;
    }

    if( e.type === 'touchmove' ) {
      $currentTarget.data( DATA.IS_TOUCH_MOVED, true );
      return;
    }

    if( e.type === 'touchend' ) {
      // is touch moved
      if( $currentTarget.data( DATA.IS_TOUCH_MOVED ) ) {
        console.log( 'touch moved' );
        return;
      }

      // is long tap
      if(  e.timeStamp - $currentTarget.data( DATA.TIMESTAMP ) > LongTapTime  ) {
        console.log( 'long tap' );
        return;
      }

      console.log( 'touchend listener', $currentTarget.data( DATA.EVENT_NAME ), $target );
      _eventFire( $target, $currentTarget.data( DATA.EVENT_NAME ) );
    }
  }


  /**
   * _onClickListener
   * PCで閲覧するときはclickで発火する
   * touchstartが発火した際のフラグで判断
   *
   * @return
   * */
  function _onClickListener ( e ) {
    var $target = $( e.target );
    var $currentTarget = $( e.currentTarget );

    // タッチイベントが既に発火していた場合
    if( $currentTarget.data( DATA.IS_TOUCHED ) ) {
      return;
    }

    console.log( 'click listener', $currentTarget.data( DATA.EVENT_NAME ), $target );
    _eventFire( $target, $currentTarget.data( DATA.EVENT_NAME ) );
  }


  /**
   * _eventFire
   * イベントを発火する
   * DATA.EVENT_NAMEに保存されているイベントを全て発火させる（予定）
   *
   * @return
   *
   * TODO 調整するか考え中
   * イベントにnamespaceが付いていた場合の対応が不親切にみえるけど、使用の仕方と割り切るかも。
   * touchendのeventオブジェクト渡すの忘れてる
   * */
  function _eventFire( $target, eventString ) {
    var events = eventString.split(',');

    for( var i=0, max=events.length; max>i; i++ ) {
      $target.trigger( events[i] );
      if( !RegEventNameSpace.test( events[i] ) ){
        console.log( events[i] );
      }
    }

    return;
  }

})( window, document, jQuery );
