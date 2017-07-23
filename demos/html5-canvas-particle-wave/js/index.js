var camera, scene, renderer;
var stats1, stats2, stats3;

var particle, particles, count = 0;
var psSeparation = 50, psQuantityX = 70, psQuantityY = 70;

var amplitude = 50;

var clock = new THREE.Clock( );

function init( )
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width/height;

	scene = new THREE.Scene( );
	scene.background = new THREE.Color( 0, 0, 0, 0 );

	camera = new THREE.PerspectiveCamera( 75, aspect, 1, 10000 );
	camera.position.z = 1000;
	scene.add( camera );

	if (!Detector.webgl) Detector.addGetWebGLMessage();
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	document.body.appendChild(renderer.domElement);

	clock = new THREE.Clock();

	// Stats.
	stats1 = new Stats();
	stats1.showPanel(0); // Panel 0 = fps
	stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;";
	document.body.appendChild(stats1.dom);
	stats2 = new Stats();
	stats2.showPanel(1); // Panel 0 = fps
	stats2.domElement.style.cssText = "position:absolute;top:0px;left:80px;";
	document.body.appendChild(stats2.dom);
	stats3 = new Stats();
	stats3.showPanel(2); // Panel 0 = fps
	stats3.domElement.style.cssText = "position:absolute;top:0px;left:160px;";
	document.body.appendChild(stats3.dom);

	particles = new Array();
	
	var PI2 = Math.PI * 2;
	var material = new THREE.SpriteCanvasMaterial({
		color: 0xffffff,
		program: function(context) {
			context.beginPath();
			context.arc(0, 0, 0.5, 0, PI2, true);
			context.fill();
		}
	});
	
	var i = 0;
	for (var ix = 0; ix < psQuantityX; ix++)
	{
		for (var iy = 0; iy < psQuantityY; iy++)
		{
			particle = particles[i++] = new THREE.Sprite(material);
			particle.position.x = ix * psSeparation - psQuantityX * psSeparation / 2;
			particle.position.z = iy * psSeparation - psQuantityY * psSeparation / 2;
			
			scene.add(particle);
		}
	}
}

function render() {
	var delta = clock.getDelta();
	var elapsed = clock.elapsedTime;

	var i = 0;
	for ( var ix = 0; ix < psQuantityX; ix ++ )
	{
		for ( var iy = 0; iy < psQuantityY; iy ++ )
		{
			particle = particles[i++];

			particle.position.y = ( Math.sin( ( ix + elapsed )*0.3 )*50 ) + ( Math.sin( ( iy + elapsed )*2 -1 )*amplitude );
			particle.scale.x = particle.scale.y = ( Math.sin( ( ix + elapsed )*0.3 ) + 1 )*4 + ( Math.sin( ( iy + elapsed )*0.5 ) + 1 ) *4;
		}
	}

	renderer.render(scene, camera);
}

function update() {
	requestAnimationFrame(update);
	render();

	stats1.update();
	stats2.update();
	stats3.update();
}

init();
update();