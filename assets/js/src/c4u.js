;( function ( THREE, $, window, document ) {
var CAN_PLAY = ( function () {
  var hasURL = !!( window.URL || window.webkitURL );
  return ( hasURL && Modernizr.getusermedia && Modernizr.webgl );
} )();

var _getUserMedia = function( t, onsuccess, onerror ) {
  if ( navigator.getUserMedia ) {
    return navigator.getUserMedia( t, onsuccess, onerror );
  } else if ( navigator.webkitGetUserMedia ) {
    return navigator.webkitGetUserMedia( t, onsuccess, onerror );
  } else if ( navigator.mozGetUserMedia ) {
    return navigator.mozGetUserMedia( t, onsuccess, onerror );
  } else if ( navigator.msGetUserMedia ) {
    return navigator.msGetUserMedia( t, onsuccess, onerror );
  } else {
    onerror( new Error( 'webcom is not available' ) );
  }
};

var _URL = window.URL || window.webkitURL;

var WIDTH  = 800,
    HEIGHT = 600,
    CANVAS_SCALE  = 400 / Math.max( WIDTH, HEIGHT ),
    $window = $( window );
    $container,
    $streamVideo,
    $canvas2d,
    $canvas3d,
    context2d,
    detector,
    posit,
    scene,
    camera,
    renderer,
    meshContainer,
    mesh;

if ( !CAN_PLAY ) {
  $( function () {
    $( '.c4u-help' ).addClass( 'c4u-help--hasError' );
    $( '.c4u-help-error1' ).css( { display : 'block' } );
  } );
  return;
}

var init = function () {

  $container = $( '#experiment' );
  $container.css( {
    width  : WIDTH,
    height : HEIGHT
  } );

  $streamVideo = $( '#stream' );
  $streamVideo.attr( {
    width    : WIDTH,
    height   : HEIGHT,
    loop     : true,
    volume   : 0,
    autoplay : true,
    controls : false
  } );

  _getUserMedia(
    {
      video: true,
      audio: false
    },
    function ( stream ) {
      $streamVideo[ 0 ].src = _URL.createObjectURL( stream );
    },
    function ( error ) {
      $( '.c4u-help' ).addClass( 'c4u-help--hasError' );
      $( '.c4u-help-error2' ).css( { display : 'block' } );
    }
  );

  $canvas2d = $( document.createElement( 'canvas' ) );
  $canvas2d.attr( {
    width  : WIDTH  * CANVAS_SCALE,
    height : HEIGHT * CANVAS_SCALE
  } );
  // $( 'body' ).append( $canvas2d );
  context2d = $canvas2d[ 0 ].getContext( '2d' );

  $canvas3d = $( '#canvas3d' );

  detector = new AR.Detector();
  posit = new POS.Posit( 1, WIDTH );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 1000 );
  renderer = new THREE.WebGLRenderer( {
    canvas: $canvas3d[ 0 ],
    preserveDrawingBuffer: true,
    alpha: true
  } );
  renderer.setSize( WIDTH, HEIGHT );

  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0xffffcc );
  directionalLight.position.set( 0, -1, 0 );
  scene.add( directionalLight );

  meshContainer = new THREE.Object3D();
  scene.add( meshContainer );
};

var loadModel = function () {
  var d = new $.Deferred();
  var loader = new THREE.JSONLoader();
  loader.load( './assets/3dmodel/chocolate/chocolate.js', function ( geometry, materials ) {
    for ( var i = 0, l = materials.length; i < l; i ++ ) {
      materials[ i ].side = THREE.DoubleSide;
    }
    mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshFaceMaterial( materials )
    );
    mesh.rotation.x = THREE.Math.degToRad( 90 );
    mesh.scale.set( 16, 16, 16 );
    meshContainer.add( mesh );
    d.resolve();
  } );
  return d.promise();
};

var renderLoop = function () {
  requestAnimationFrame( renderLoop );

  // see http://stackoverflow.com/questions/18580844/firefox-drawimagevideo-fails-with-ns-error-not-available-component-is-not-av
  try {
    context2d.drawImage( $streamVideo[ 0 ], 0, 0, WIDTH * CANVAS_SCALE, HEIGHT * CANVAS_SCALE );
  } catch ( e ) {
    return;
  }
  
  var imageData = context2d.getImageData( 0, 0, WIDTH * CANVAS_SCALE, HEIGHT * CANVAS_SCALE );
  var markers = detector.detect( imageData );
  if ( markers.length === 0 ) {
    return;
  }
  var corners = markers[ 0 ].corners;
  for ( var i = 0, l = corners.length; i < l; i ++ ) {
    corner = corners[ i ];
    corner.x = corner.x - ( WIDTH * CANVAS_SCALE / 2 );
    corner.y = ( HEIGHT * CANVAS_SCALE / 2 ) - corner.y;
  }
  var pose = posit.pose( corners );
  
  var rotation = pose.bestRotation;
  var translation = pose.bestTranslation;

  meshContainer.rotation.set(
    -Math.asin( -rotation[ 1 ][ 2 ] ),
    -Math.atan2( rotation[ 0 ][ 2 ], rotation[ 2 ][ 2 ] ),
     Math.atan2( rotation[ 1 ][ 0 ], rotation[ 1 ][ 1 ] )
  );
  meshContainer.position.set(
     translation[ 0 ],
     translation[ 1 ],
    -translation[ 2 ]
  );

  renderer.render( scene, camera );
};

var iGotIt = function () {
  var d = new $.Deferred();
  var HIDE_CLASS = 'c4u-help--checked';
  var $help = $( '.c4u-help' );
  var $button = $( '#playButton' );
  $button.one( 'click', function () {
    $help.addClass( HIDE_CLASS );
    $button.fadeOut();
    d.resolve();
  } );
  return d.promise();
};

var waitTillOnload = function () {
  // Firefox will call error, if `drawImage()` is called before onload.
  var d = new $.Deferred();
  window.addEventListener( 'load', function () {
    d.resolve();
  } );
  return d.promise();
};

init();
$.when(
  iGotIt(),
  loadModel(),
  waitTillOnload()
).done( function () {
  renderLoop();
} );







$( function () {
  var $info = $( '.c4u-pageHeader-info' );
  var $button = $info.find( '.c4u-pageHeader-infoButton' );
  var $contents = $info.find( '.c4u-pageHeader-infoBody' );
  $button.on( 'click', function () {
    $contents.slideToggle();
  } );
} );


$( function () {
  var $canvas = $( document.createElement( 'canvas' ) );
  $canvas.attr( {
    width  : WIDTH,
    height : HEIGHT
  } );
  var ctx = $canvas[ 0 ].getContext( '2d' );
  $( '#takephoto' ).on( 'click', function () {
    $canvas[ 0 ].width = $canvas[ 0 ].width;

    var image3d = new Image();
    image3d.src = $canvas3d[ 0 ].toDataURL( 'image/png' );

    ctx.drawImage( $streamVideo[ 0 ], 0, 0, WIDTH, HEIGHT );
    ctx.drawImage( image3d, 0, 0, WIDTH, HEIGHT );
    var src = $canvas[ 0 ].toDataURL( 'image/png' );
    var dataurl = [
      'data:text/html,',
      '<body style="margin:0;padding:0;">',
      '<img src="',
      src,
      '"/>'
    ].join('');
    window.open( dataurl, '', 'width=' + WIDTH + ', height=' + HEIGHT + ', menubar=no, toolbar=no, scrollbars=yes' );
  } );
} );

} )( THREE, jQuery, window, document );