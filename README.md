# jquery.tap.js

タブレットやスマートフォン向けのWebサイトを作るときに、ボタン系の動作がclickイベントでは遅延が発生し、気持ちのよいレスポンスが得られないので
それを解決するために作成した。

他に同名のライブラリがあるようだが、余り言及しないが幾つか気になる点がコード内にあったため、改めて作成している。

どれが正しいというものではないと思うし、今考えてる実装でも使い方を間違えると問題になる内容はあるので、使うなら注意してつかってください。
全てのリンクに対して実装するような強制するようなライブラリではなく、ゆるい仕様なので、リスナーやハンドラーを付けなければ通常の動作をするだけなので、注意してほしい。


* ネームスペースを使ったlistenTap,listenTapDestroyは実装していない
* まだ調整中。迷いながら作っているので、テストがまだない。



```javascript
// listen start
$(window).litenTap();

// listen end
$(window).litenTapDestroy();


// event name change.
// listen start
$(window).litenTap( 'originalEventName' );

// listen end
$(window).litenTapDestroy( 'originalEventName' );
```

```javascript
$(window).litenTap();
// or $(window).litenTap( 'tap' );

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

