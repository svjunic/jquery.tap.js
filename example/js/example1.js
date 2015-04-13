(function( window, document, $ ) {

  var $el  = $( '#normal .stage' );
  var $log = $( '#normal .log tbody' );

  // listenTap
  $el.listenTap();

  var $button  = $el.find( 'button' );
  var $a       = $el.find( 'a.standard' );
  var $link    = $el.find( 'a.notlink' );

  var $splink  = $el.find( 'a.splink' );
  var $splink2 = $el.find( 'a.splink2' );


  $button.on( 'tap', onTapListener );
  $a.on( 'tap', onTapListener );
  
  $link.on( 'click', onClickThroughListener );
  $link.on( 'tap', onTapListener );
  
  $splink.on( 'tap', onTapListener );
  $splink.on( 'tap', onTapDomUpdateEventListener );
  $splink.on( 'tap', onTapListener );
  $splink.on( 'click', onClickThroughListener );
  $splink2.on( 'click', onTapListener );

  function onTapListener( e ) {
    console.log( 'EventType:' + e.type + ' ' + $(e.currentTarget).text()  );
    $log.prepend( '<tr><td>' + e.type + '</td><td>' + $(e.currentTarget).text() + '</td><td>' + new Date() + '</td><td>' + e.target + '</td></tr>' );
  }
  
  function onTapDomUpdateEventListener( e ) {
    $splink2.removeClass('hide');
    setTimeout(function() { 
      $splink2.addClass('hide');
    } , 2000 );
    $splink2.removeClass('hide');
  }


  function onClickThroughListener( e ) {
    e.preventDefault();
    e.stopPropagation();
  }


})( window, document, jQuery );
