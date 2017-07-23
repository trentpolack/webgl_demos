var container;
var camera, scene, renderer, controls;
var stats1, stats2, stats3;
var clock = new THREE.Clock();
var math = THREE.Math;
var frameCount = 0;

var particleCount = 20000;
var particleArray = [];
var worldRadius = 500.0;
var particles, geometry, materials = [], parameters, i, h, color, size;
var particleSize = 4;

var smaaRenderPass, bloomPass, renderScene;
var dynamicHdrEffectComposer;

var params = {
	projection: "normal",
	background: false,
	
	bloomStrength: 1.5,
	bloomThreshold: 0.1,
	bloomRadius: 0.75,
	exposure: 0.95,
};

function init( ) {
	container = document.body;
	
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width/height;

	scene = new THREE.Scene( );
	scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

	camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 5000 );
	scene.add( camera );
	camera.position.z = 100;

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	renderer = Detector.webgl ? ( new THREE.WebGLRenderer( ) ) : ( new THREE.CanvasRenderer( ) );
	renderer.toneMapping = THREE.LinearToneMapping;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	renderer.gammaInput = true;
	renderer.gammaOutput = false;
	container.appendChild( renderer.domElement );

	clock = new THREE.Clock();

	// Stats.
	stats1 = new Stats();
	stats1.showPanel(0); // Panel 0 = fps
	stats1.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
	container.appendChild( stats1.dom );
	stats2 = new Stats();
	stats2.showPanel(1); // Panel 0 = fps
	stats2.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
	container.appendChild( stats2.dom );
	stats3 = new Stats();
	stats3.showPanel(2); // Panel 0 = fps
	stats3.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';
	container.appendChild( stats3.dom );
	
	// Setup the orbit controls.
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update( );
	
	// Setup a resize listener.
	window.addEventListener( 'resize', onWindowResize, false );
	
	setupPostStack( );
	setupScene( );
}

function setupPostStack( )
{
	renderScene = new THREE.RenderPass( scene, camera, undefined, undefined, undefined );

	bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth*2, window.innerHeight*2), params.bloomStrength, params.bloomRadius, params.bloomThreshold );
	
	// Setup render targets.
	var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
	
	if( renderer.extensions.get('OES_texture_half_float_linear') )
	{
		parameters.type = THREE.FloatType;
	}
	
	var hdrRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );
	dynamicHdrEffectComposer = new THREE.EffectComposer( renderer, hdrRenderTarget );
	dynamicHdrEffectComposer.setSize( window.innerWidth, window.innerHeight );

	smaaRenderPass = new THREE.SMAAPass( window.innerWidth, window.innerHeight );
	smaaRenderPass.renderToScreen = true;
	
	dynamicHdrEffectComposer.addPass( renderScene );
	dynamicHdrEffectComposer.addPass( bloomPass );
	dynamicHdrEffectComposer.addPass( smaaRenderPass );
}

function setupScene( )
{	
	var positions = new Float32Array( particleCount*3 );
	var colors = new Float32Array( particleCount*3 );
	var sizes = new Float32Array( particleCount );	
	for ( var i = 0; i < particleCount; i ++ ) 
	{
		var vertex = new THREE.Vector3();
		var color = new THREE.Color( 0xffffff );

		var theta = 2*THREE.Math.randFloat( 0.0, 2*Math.PI );
		var phi = Math.acos( 1 - THREE.Math.randFloat( 0.0, 2*Math.PI ) );
		vertex.x = ( ( Math.sin( phi )*Math.cos( theta ) )*worldRadius )*THREE.Math.randFloat( 0.5, 1.0 );
		vertex.y = ( ( Math.sin( phi )*Math.sin( theta ) )*worldRadius )*THREE.Math.randFloat( 0.5, 1.0 );
		vertex.z = ( ( Math.cos( phi ) )*worldRadius )*THREE.Math.randFloat( 0.5, 1.0 );
		
		vertex.toArray( positions, i*3 );
		
		color.setHSL( 0.0 + 0.1 * ( i / particleCount ), 0.9, 0.5 );
		color.toArray( colors, i*3 );

		sizes[i] = particleSize;
	}
	
	geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.computeBoundingSphere();

	var material = new THREE.ShaderMaterial( {
		uniforms: {
					time: { value: clock.elapsedTime }
		},
		vertexShader:   document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});
	
	particles = new THREE.Points( geometry, material );
	scene.add( particles );
}

function onWindowResize( )
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	camera.aspect = width/height;
	camera.updateProjectionMatrix( );

	renderer.setSize( width, height );
	dynamicHdrEffectComposer.setSize( width, height );
}

function render( )
{
	if( bloomPass )
	{
		bloomPass.bloomStrength = params.bloomStrength;
		bloomPass.bloomRadius = params.bloomRadius;
		bloomPass.bloomThreshold = params.bloomThreshold;
	}
	
	renderer.toneMappingExposure = Math.pow( params.exposure, 4.0 );
	
	var geometry = particles.geometry;
	var attributes = geometry.attributes;
	for ( var i = 0; i < attributes.size.array.length; i++ ) {
		attributes.size.array[i] = particleSize + ( particleSize - 1 ) * Math.sin( ( 0.1*i ) + clock.elapsedTime );
	}
	attributes.size.needsUpdate = true;
	
	dynamicHdrEffectComposer.render( );
}

function update() {
	requestAnimationFrame( update );

	var delta = clock.getDelta( );
	var elapsed = clock.elapsedTime;
	
	particles.rotation.x = -0.01*elapsed;
	particles.rotation.z = 0.01*elapsed;
		
	render();

	stats1.update();
	stats2.update();
	stats3.update();
}

init();
update();