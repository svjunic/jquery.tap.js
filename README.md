# jquery.tap.js

タブレットやスマートフォン向けのWebサイトを作るときに、ボタン系の動作がclickイベントでは遅延が発生し、気持ちのよいレスポンスが得られないので
それを解決するために作成した。

他に同名のライブラリがあるようだが、余り言及しないが幾つか気になる点がコード内にあったため、改めて作成している。

どれが正しいというものではないと思うし、今考えてる実装でも使い方を間違えると問題になる内容はあるので、使うなら注意してつかってください。
全てのリンクに対して実装するような強制するようなライブラリではなく、ゆるい仕様なので、リスナーやハンドラーを付けなければ通常の動作をするだけなので、注意してほしい。


* ネームスペースを使ったlistenTap,listenTapDestroyは実装していない
* まだ調整中。迷いながら作っているので、テストがまだない。


300ms後にクリックイベントが発生するが、それは個別で制御する必要がある。
プラグイン側での制御がしづらい、することによって汎用性を失う場合もあるため。


```javascript
// listen start
$(window).listenTap();

// listen end
$(window).listenTapDestroy();


// event name change.
// listen start
$(window).listenTap( 'originalEventName' );

// listen end
$(window).listenTapDestroy( 'originalEventName' );
```

```javascript
$(window).listenTap();
// or $(window).listenTap( 'tap' );

$('a').on( 'tap', function( e ) {
  e.preventDefault();
  // action
});


$('button').on( 'tap', function( e ) {
  e.preventDefault();
  // action
});

// fire
$('button').on( 'tap.mogeta', function( e ) {
  e.preventDefault();
  // action
});
```


```javascript
// limited use

$el = $('div');

$el.listenTap();

$el.find( 'a' ).on( 'tap', function( e ) {
  e.preventDefault();
  // action
});
```


```javascript
// namespace event
$el = $('div');

$el.listenTap( 'tap.mogeta' );

// fire
$el.find( 'a' ).on( 'tap.mogeta', function( e ) {
  e.preventDefault();
  // action
});

// not fire
$el.find( 'a' ).on( 'tap', function( e ) {
  e.preventDefault();
  // action
});
```

