/**
 * Copyright 2013, jun fujimura
 * The MIT License (MIT)
 */
(function( window, document, $ ) {

  "use strict";

  var DATA = {
    EVENT_NAME     : 'eventName',
    IS_TOUCHED     : 'isToudched',
    IS_TOUCH_MOVED : 'isToudchMoved',
    TIMESTAMP      : 'touchstartTimestamp',
  };


  var DefaultEventName = 'tap';
  var LongTapTime      = 500;

  var RegDontUseEventNames = /^(blur|focus|change|select|selectstart|submit|reset|abort|error|load|unload|click|dblclick|keyup|keydown|keypress|mouseout|mouseover|mouseup|mousedown|mousemove|dragdrop|touchstart|touchmove|touchend)/;
  var RegEventName         = /^[a-zZ-Z0-9]*\.[a-zZ-Z0-9]*$/;

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

    $this.on( originalEventName, eventStopPropagation );

    return $this;
  };

  $.fn.listenTapDestroy = function () {
    var $this = $(this);
    _removeTapEventListener( $this );
    $this.off( originalEventName, eventStopPropagation );
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

    $this.data( DATA.EVENT_NAME, eventsString );
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
    // remove custom data
    $this.removeData( DATA.EVENT_NAME );

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

  function _eventFire( $target, events ) {
/*
    不要なイベントは発火させない

    イベントの重複を確認

    こっちは問題なし

    tap
    こっちの場合は、tap.がないか確認する必要あり
    tap.event

    順番としては、
    tap.xxxxx.xxxx
    の場合、前方の
    tap.xxxxx
    のイベント

    tap
    のイベントがないか確認、あれば未実行
    なければ実行

    このままだと
    $window にlistenしたあとで
    $body   にlistenしたら
    triggerが２回叩かれることになるよね。
    これでいいのかな・・・。


    いや、これでいい。
    listenTap( '' );

    これで指定したイベントを全て実行するような形のライブラリにしよう
*/


    var reg = /^[a-zZ-Z0-9]*\.[a-zZ-Z0-9]*$/;
    // namespace 
    /* TODO イベントにnamespaceが付いていた場合の対応が不親切 */
    for( var i=0, max=events.length; max>i; i++ ) {
      $target.trigger( events[i] );
      if( !reg.test( events[i] ) ){
        console.log( events[i] );
      }
    }
  }

  function eventStopPropagation( e ) {
    e.stopPropagation();
  }


})( window, document, jQuery );
