/**
 * Copyright 2013, jun fujimura
 * The MIT License (MIT)
 */
(function( window, document, $ ) {

  "use strict";

  /**
   * カスタムデータの名前
   *
   * @type object
   * @private
   * */
  var DATA = {
    EVENT_NAME     : 'eventName',
    IS_TOUCHED     : 'isToudched',
    IS_TOUCH_MOVED : 'isToudchMoved',
    TIMESTAMP      : 'touchstartTimestamp',
  };

  /**
   * デフォルトのクラス名
   *
   * @type jQuery.Event
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

    /* TODO
     * イベントの送出止めちゃうか考え中オプションでもいいけど、ややこしくなる
     * 止めたくないならwindowでlistenTapすればいいだけだしな・・。
     * */
    //$this.on( originalEventName, _eventStopPropagation );

    return $this;
  };

  /**
   * jQuery.fn.listenTapDestroy
   *
   * @type {jQuery.Function}
   * @method listenTap
   * */
  $.fn.listenTapDestroy = function ( _eventName ) {

    var eventName = _eventName || DefaultEventName;

    var $this = $(this);

    _removeTapEventListener( $this );

    /* TODO
     * イベントの送出止めちゃうか考え中オプションでもいいけど、ややこしくなる
     * 止めたくないならwindowでlistenTapすればいいだけだしな・・。
     * */
    // $this.off( originalEventName, _eventStopPropagation );

    return $this;
  };


  /**
   * _addTapEventListener
   *
   * @return $(this)
   */
  function _addTapEventListener( $this, eventName ) {
    // 発火するイベント名の登録

    // イベントを追加
    var events, eventsString;

    eventsString = $this.data( DATA.EVENT_NAME );

    if( typeof eventsString === 'undefined' ){
      events = [];
      events.push(eventName);
    } else {
      events = $this.data(DATA.EVENT_NAME).split(',');
      events.push(eventName);
    }
    eventsString = events.join(',');

    /**
     * DATA.EVENT_NAME 
     * xxx,mmmmみたいな感じの,区切りで指定したイベント名を持っている複数指定する場面はレアだと思うけど。
     */
    $this.data( DATA.EVENT_NAME, eventsString );
   
    /**
     * DATA.IS_TOUCHED
     * true  : touchstartが発生した
     * false : touchstartが発生していない
     */
    $this.data( DATA.IS_TOUCHED, false );
    
    $this.on( 'touchstart touchmove touchend', _onTouchEventListener);
    $this.on( 'click'                        , _onClickListener );

    return $this;
  }

  /**
   * _removeTapEventListener
   *
   * @return $(this)
   */
  function _removeTapEventListener( $this ) {
    // TODO:複数イベント設定した場合の対応がまだ
    $this.removeData( DATA.EVENT_NAME );

    // remove custom data
    $this.removeData( DATA.IS_TOUCHED );
    $this.removeData( DATA.IS_TOUCH_MOVED );
    $this.removeData( DATA.TIMESTAMP );

    // remove event 
    $this.off( 'touchstart touchmove touchend', _onTouchEventListener);
    $this.off( 'click'                        , _onClickListener );

    // clear timerid(logtap)
    clearTimeout( $this.data( DATA.LONG_TAP_TIMER_ID ) );

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
      _eventFire( $target, $currentTarget.data( DATA.EVENT_NAME ).split(',') );
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
    _eventFire( $target, $currentTarget.data( DATA.EVENT_NAME ).split(',') );
  }


  /**
   * _eventFire
   * イベントを発火する
   * DATA.EVENT_NAMEに保存されているイベントを全て発火させる（予定）
   *
   * @return
   *
   *
   * TODO 調整するか考え中
   * イベントにnamespaceが付いていた場合の対応が不親切にみえるけど、使用の仕方と割り切るかも。
   * touchendのeventオブジェクト渡すの忘れてる
   * */
  function _eventFire( $target, events ) {

    for( var i=0, max=events.length; max>i; i++ ) {
      $target.trigger( events[i] );
      if( !RegEventNameSpace.test( events[i] ) ){
        console.log( events[i] );
      }
    }

    return;
  }


  /**
   * _eventStopPropagation
   * 検証の時にノリで書いたけどオプションで残してもいいかなぐらいのノリで作った。
   * 使っていない。
   * TODO 仕様決めてから消すか生かすか決める
   *
   * @return
   * */
  function _eventStopPropagation( e ) {
    e.stopPropagation();
    return;
  }


})( window, document, jQuery );
