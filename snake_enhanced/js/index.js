/* click to the atrract the snake bugs */

let config = {
    SENSIBILIDAD_AUDIO: 1.6,
    FRECUENCIA_RANGO: 1,
	FRECUENCIA_RANGO_PRINCIPIO: 0,
	NUM_CADENAS: 50,
	LONGITUD_CADENA: 8,
	LIMITE_DETECCION: 50,
	MULTIPLICADOR_LIMITE_AUDIO: 1.5,
	FRECUENCIA_MOVIMIENTO_VARIABLE_AUDIO: 200,
	MULTIPLICADOR_FONDO_AUDIO: 2,
	GRADO_UNION_AUDIO: 0.01, // Más es menos unión
	GRADO_UNION_MOUSE: 0.03, // Más es menos unión
	MULTIPLICADOR_IMPULSO_NORMAL: 0.1,
	MULTIPLICADOR_IMPULSO_AUDIO: 0.1,
	TIPO_OBJETO: "square",
	NUM_PINCHOS: 5,
	MULTIPLICADOR_RADIO_INTERIOR_ESTRELLA: 0.4,
	TEXTO_CUSTOM: "",
	RADIO_OBJETO: 1,
	COLOR_OBJETO_NORMAL: { r: 0, g: 170, b: 255 },
	COLOR_OBJETO_DETECCION: { r: 255, g: 0, b: 0 },
	COLOR_OBJETO_MOUSE: { r: 0, g: 255, b: 0 },
	COLOR_OBJETO_AUDIO_MULTICOLOR: false,
	CAMBIO_COLOR_DEPENDE_AUDIO: false,
	CAMBIO_COLOR_CONSTANTE_FRECUENCIA: 1,
	MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO: 0.5,
	COLOR_OBJETO_AUDIO: { r: 255, g: 255, b: 0 }
};

var cant = 0;
var color_multicolor = {r: 255, g: 0, b: 0};
var estado = 1;

var a = document.getElementById( 'c' ),
	c = a.getContext( '2d' );

var chains = [],
	chainCount = config.NUM_CADENAS,
	entityCount = config.LONGITUD_CADENA,
	w = a.width,
	h = a.height,
	cx = w / 2,
	cy = h / 2,
	mx = cx,
	my = cy,
	md = 0,
	tick = 0,
	maxa = 2,
	maxv = 1,
	avoidTick = 20,
	avoidThresh = config.LIMITE_DETECCION,
	TWO_PI = Math.PI * 2;

var variacionX = Math.floor(rand(0, w));
var variacionY = Math.floor(rand(0, h));
var indice = 0;

function rand( min, max ) {
	return Math.random() * ( max - min ) + min;
}

const RGBToHSL = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

function Impulse() {
	this.x = cx;
	this.y = cy;
	this.ax = 0;
	this.ay = 0;
	this.vx = 0;
	this.vy = 0;
	this.r = 1;
}

function aleatorioLento(anterior, maximo)
{
	if (indice < config.FRECUENCIA_MOVIMIENTO_VARIABLE_AUDIO)
	{
		indice += 1;
		return anterior;
	}
	else
	{
		indice = 0;
		return Math.floor(rand(0, maximo));
	}
}

function actualizarColor()
{
	if (estado === 1)
	{
		color_multicolor.g = Math.round(Math.min(color_multicolor.g + (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 255));
		if (color_multicolor.g === 255) estado = 2;
	}
	else if (estado === 2)
	{
		color_multicolor.r = Math.round(Math.max(color_multicolor.r - (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 0));
		if (color_multicolor.r === 0) estado = 3;
	}
	else if (estado === 3)
	{
		color_multicolor.b = Math.round(Math.min(color_multicolor.b + (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 255));
		if (color_multicolor.b === 255) estado = 4;
	}
	else if (estado === 4)
	{
		color_multicolor.g = Math.round(Math.max(color_multicolor.g - (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 0));
		if (color_multicolor.g === 0) estado = 5;
	}
	else if (estado === 5)
	{
		color_multicolor.r = Math.round(Math.min(color_multicolor.r + (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 255));
		if (color_multicolor.r === 255) estado = 6;
	}
	else if (estado === 6)
	{
		color_multicolor.b = Math.round(Math.max(color_multicolor.b - (config.CAMBIO_COLOR_DEPENDE_AUDIO ? (config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO * cant) : config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA), 0));
		if (color_multicolor.b === 0) estado = 1;
	}
}

Impulse.prototype.step = function() {
	this.x += this.vx;
	this.y += this.vy;
	if( this.x + this.r >= w || this.x <= this.r ) { this.vx = 0; this.ax = 0; }
	if( this.y + this.r >= h || this.y <= this.r ) { this.vy = 0; this.ay = 0; }
	if( this.x + this.r >= w ) { this.x = w - this.r; }
	if( this.x <= this.r ) { this.x = this.r; }
	if( this.y + this.r >= h ) { this.y = h - this.r; }
	if( this.y <= this.r ) { this.y = this.r; }
	
	//document.getElementById("idCoords").innerHTML = variacionX + "," + variacionY + ", cantidad: " + cant;
	
	if (cant > 0)
	{
		bg = 'radial-gradient(rgb(' + (34+(Math.min(config.MULTIPLICADOR_FONDO_AUDIO*cant,255))) + ',' + (34+(Math.min(config.MULTIPLICADOR_FONDO_AUDIO*cant,255))) + ',' + (34+(Math.min(config.MULTIPLICADOR_FONDO_AUDIO*cant,255))) + '), rgb(0,0,0))';
		variacionX = aleatorioLento(variacionX, w);
		variacionY = aleatorioLento(variacionY, h);
		actualizarColor();
		this.vx += ( variacionX - this.x ) * config.GRADO_UNION_AUDIO;
		this.vy += ( variacionY - this.y ) * config.GRADO_UNION_AUDIO;
	}
	else bg = 'radial-gradient(#222, #000)';
	
	document.body.style.background = bg;
	
	if( md )
	{
		this.vx += ( mx - this.x ) * config.GRADO_UNION_MOUSE;
		this.vy += ( my - this.y ) * config.GRADO_UNION_MOUSE;
	}

	this.ax += rand( -0.4, 0.4 );
	this.ay += rand( -0.4, 0.4 );
	this.vx += this.ax;
	this.vy += this.ay;
	this.ax *= Math.abs( this.ax ) > maxa ? 0.75 : 1;
	this.ay *= Math.abs( this.ay ) > maxa ? 0.75 : 1;
	this.vx *= Math.abs( this.vx ) > maxv ? 0.75 : 1;
	this.vy *= Math.abs( this.vy ) > maxv ? 0.75 : 1;
};

function Chain() {
	this.branches = [];
	this.impulse = new Impulse();
	this.branches.push( new Branch({
		chain: this,
		attractor: this.impulse
	}));
}

Chain.prototype.step = function() {
	this.impulse.step();
	this.branches.forEach( function( branch, i ) {
		branch.step();
	});

	this.branches.forEach( function( branch, i ) {
		branch.draw();
	});
};

function Branch( opt ) {
	this.entities = [];
	this.chain = opt.chain;
	this.avoiding = 0;
	var entity;
	for( var i = 0; i < entityCount; i++ ) {
		entity = new Entity({
			branch: this,
			i: i,
			x: cx,
			y: cy,
			radius: config.RADIO_OBJETO + ( entityCount - i ) / entityCount * 5,
			damp: 0.2,
			attractor: i === 0 ? opt.attractor : this.entities[ i - 1 ]
		});
		this.entities.push( entity );
	}
}

Branch.prototype.step = function() {
	var i = chains.length;
	while( i-- ) {
		var impulse = this.chain.impulse,
			oImpulse = chains[ i ].impulse,
			dx = oImpulse.x - impulse.x,
			dy = oImpulse.y - impulse.y,
			dist = Math.sqrt( dx * dx + dy * dy );
		if( !md && impulse !== oImpulse && dist < avoidThresh ) {
			impulse.ax = 0;
			impulse.ay = 0;
			if (cant === 0)
			{
				impulse.vx -= dx * config.MULTIPLICADOR_IMPULSO_NORMAL;
				impulse.vy -= dy * config.MULTIPLICADOR_IMPULSO_NORMAL;
				avoidThresh = config.LIMITE_DETECCION;
			}
			else
			{
				impulse.vx -= dx * config.MULTIPLICADOR_IMPULSO_AUDIO * cant;
				impulse.vy -= dy * config.MULTIPLICADOR_IMPULSO_AUDIO * cant;
				avoidThresh = config.LIMITE_DETECCION * config.MULTIPLICADOR_LIMITE_AUDIO;
			}
			this.avoiding = avoidTick;
		}
	}

	this.entities.forEach( function( entity, i ) {
		entity.step();
	});

	if( this.avoiding > 0 ) {
		this.avoiding--;
	}
};

Branch.prototype.draw = function() {
	var self = this;
	c.beginPath();
	c.moveTo( this.entities[ 0 ].x, this.entities[ 0 ].y );
	this.entities.forEach( function( entity, i ) {
		if( i > 0 ) {
			c.lineTo( entity.x, entity.y );
		}
	});
	//c.strokeStyle = 'hsla(' + ( md ? 120 : (cant > 0 ? 60 : ( self.avoiding ? 0 : 200) ) ) + ', 70%, 60%, 0.3)';
	c.strokeStyle = 'hsla(' + ( md ? RGBToHSL(config.COLOR_OBJETO_MOUSE.r, config.COLOR_OBJETO_MOUSE.g, config.COLOR_OBJETO_MOUSE.b)[0] : ( config.COLOR_OBJETO_AUDIO_MULTICOLOR && cant > 0 ? RGBToHSL(color_multicolor.r, color_multicolor.g, color_multicolor.b)[0] : (cant > 0 ? RGBToHSL(config.COLOR_OBJETO_AUDIO.r, config.COLOR_OBJETO_AUDIO.g, config.COLOR_OBJETO_AUDIO.b)[0] : ( self.avoiding ? RGBToHSL(config.COLOR_OBJETO_DETECCION.r, config.COLOR_OBJETO_DETECCION.g, config.COLOR_OBJETO_DETECCION.b)[0] : RGBToHSL(config.COLOR_OBJETO_NORMAL.r, config.COLOR_OBJETO_NORMAL.g, config.COLOR_OBJETO_NORMAL.b)[0]) ) ) ) + ', 70%, 60%, 0.3)';
	c.stroke();

	this.entities.forEach( function( entity, i ) {
		c.save();
		c.translate( entity.x, entity.y );
		c.beginPath();
		c.rotate( entity.rot );
		if( entity.i === 0 ) {
			//c.fillStyle = ( md ? '#6c6' : (cant > 0 ? '#ff6' : ( self.avoiding ? '#c66' : '#6bf') ) );
			c.fillStyle = 'hsla(' + ( md ? RGBToHSL(config.COLOR_OBJETO_MOUSE.r, config.COLOR_OBJETO_MOUSE.g, config.COLOR_OBJETO_MOUSE.b)[0] : ( config.COLOR_OBJETO_AUDIO_MULTICOLOR && cant > 0 ? RGBToHSL(color_multicolor.r, color_multicolor.g, color_multicolor.b)[0] : (cant > 0 ? RGBToHSL(config.COLOR_OBJETO_AUDIO.r, config.COLOR_OBJETO_AUDIO.g, config.COLOR_OBJETO_AUDIO.b)[0] : ( self.avoiding ? RGBToHSL(config.COLOR_OBJETO_DETECCION.r, config.COLOR_OBJETO_DETECCION.g, config.COLOR_OBJETO_DETECCION.b)[0] : RGBToHSL(config.COLOR_OBJETO_NORMAL.r, config.COLOR_OBJETO_NORMAL.g, config.COLOR_OBJETO_NORMAL.b)[0]) ) ) ) + ', 50%, 60%, 1)';
		} else {
			//c.fillStyle = 'hsla(' + ( md ? 120 : (cant > 0 ? 60 : ( self.avoiding ? 0 : 200) ) ) + ', 70%, ' + Math.min( 50, ( 5 + ( ( entity.av / maxv ) * 20 ) ) ) + '%, ' + ( ( ( entityCount - i ) / entityCount ) ) + ')';
			c.fillStyle = 'hsla(' + ( md ? RGBToHSL(config.COLOR_OBJETO_MOUSE.r, config.COLOR_OBJETO_MOUSE.g, config.COLOR_OBJETO_MOUSE.b)[0] : ( config.COLOR_OBJETO_AUDIO_MULTICOLOR && cant > 0 ? RGBToHSL(color_multicolor.r, color_multicolor.g, color_multicolor.b)[0] : (cant > 0 ? RGBToHSL(config.COLOR_OBJETO_AUDIO.r, config.COLOR_OBJETO_AUDIO.g, config.COLOR_OBJETO_AUDIO.b)[0] : ( self.avoiding ? RGBToHSL(config.COLOR_OBJETO_DETECCION.r, config.COLOR_OBJETO_DETECCION.g, config.COLOR_OBJETO_DETECCION.b)[0] : RGBToHSL(config.COLOR_OBJETO_NORMAL.r, config.COLOR_OBJETO_NORMAL.g, config.COLOR_OBJETO_NORMAL.b)[0]) ) ) ) + ', 70%, ' + Math.min( 50, ( 5 + ( ( entity.av / maxv ) * 20 ) ) ) + '%, ' + ( ( ( entityCount - i ) / entityCount ) ) + ')';
		}
		if (config.TIPO_OBJETO === "square")
		{
			c.fillRect( -entity.radius, -entity.radius, entity.radius * 2, entity.radius * 2 );
		}
		else if (config.TIPO_OBJETO === "circle")
		{
			c.ellipse(0, 0, entity.radius, entity.radius, 0, 0, TWO_PI);
			c.fill();
		}
		else if (config.TIPO_OBJETO === "triangle")
		{
			c.moveTo(-entity.radius, -entity.radius); // Punto de comienzo
			c.lineTo(-entity.radius, entity.radius); // P1
			c.lineTo(entity.radius, 0); // P2
			c.fill();
		}
		else if (config.TIPO_OBJETO === "star")
		{
			var rot = Math.PI/2*3;
			var x = 0;
			var y = 0;
			var step = Math.PI / config.NUM_PINCHOS;

			c.moveTo(0, -entity.radius)
			for(i = 0; i < config.NUM_PINCHOS; i++){
				x = Math.cos(rot) * entity.radius;
				y = Math.sin(rot) * entity.radius;
				c.lineTo(x, y);
				rot += step;

				x = Math.cos(rot) * (entity.radius * config.MULTIPLICADOR_RADIO_INTERIOR_ESTRELLA);
				y = Math.sin(rot) * (entity.radius * config.MULTIPLICADOR_RADIO_INTERIOR_ESTRELLA);
				c.lineTo(x, y);
				rot += step;
			}
			c.lineTo(0, -entity.radius);
			c.fill();
		}
		else if (config.TIPO_OBJETO === "text")
		{
			c.font = "" + Math.floor(entity.radius*2) + "px serif";
			c.fillText(config.TEXTO_CUSTOM, 0, 0);
		}
		c.restore();
	});

};

function Entity( opt ) {
	this.branch = opt.branch;
	this.i = opt.i;
	this.x = opt.x;
	this.y = opt.y;
	this.vx = 0;
	this.vy = 0;
	this.radius = opt.radius;
	this.attractor = opt.attractor;
	this.damp = opt.damp;
}

Entity.prototype.step = function() {
	this.vx = ( this.attractor.x - this.x ) * this.damp;
	this.vy = ( this.attractor.y - this.y ) * this.damp;
	this.x += this.vx;
	this.y += this.vy;
	this.av = ( Math.abs( this.vx ) + Math.abs( this.vy ) ) / 2;

	var dx = this.attractor.x - this.x,
		dy = this.attractor.y - this.y;
	this.rot = Math.atan2( dy, dx );
};

function loop() {
	requestAnimationFrame( loop );

	c.globalCompositeOperation = 'destination-out';
	c.fillStyle = 'rgba(0, 0, 0, 1)';
	c.fillRect( 0, 0, a.width, a.height );
	c.globalCompositeOperation = 'lighter';

	chains.forEach( function( chain, i ) {
		chain.step();
	});

	tick++;
}

function resize() {
	a.width = window.innerWidth;
	a.height = window.innerHeight;
	w = a.width;
	h = a.height;
	cx = w / 2;
	cy = h / 2;
}

window.addEventListener( 'resize', resize );

window.addEventListener( 'mousedown', function() {
	md = 1;
});

window.addEventListener( 'mouseup', function() {
	md = 0;
});

window.addEventListener( 'mousemove', function( e ) {
	mx = e.clientX;
	my = e.clientY;
});

document.addEventListener("DOMContentLoaded", () => {   
	window.wallpaperPropertyListener = {
        applyUserProperties: (properties) => {
            if (properties.sensibilidad_audio) config.SENSIBILIDAD_AUDIO = properties.sensibilidad_audio.value;
			if (properties.frecuencia_rango) config.FRECUENCIA_RANGO = properties.frecuencia_rango.value;
			if (properties.frecuencia_rango_principio) config.FRECUENCIA_RANGO_PRINCIPIO = properties.frecuencia_rango_principio.value;
			if (properties.num_cadenas) 
			{
				config.NUM_CADENAS = properties.num_cadenas.value;
				chainCount = config.NUM_CADENAS;
				chains = [];
				for( var i = 0; i < chainCount; i++ ) {
					chains.push( new Chain() );
				}
			}
			if (properties.longitud_cadena)
			{
				config.LONGITUD_CADENA = properties.longitud_cadena.value;
				entityCount = config.LONGITUD_CADENA;
				chains = [];
				for( var i = 0; i < chainCount; i++ ) {
					chains.push( new Chain() );
				}
			}
			if (properties.limite_deteccion) config.LIMITE_DETECCION = properties.limite_deteccion.value;
			if (properties.multiplicador_limite_audio) config.MULTIPLICADOR_LIMITE_AUDIO = properties.multiplicador_limite_audio.value;
			if (properties.frecuencia_movimiento_variable_audio) config.FRECUENCIA_MOVIMIENTO_VARIABLE_AUDIO = properties.frecuencia_movimiento_variable_audio.value;
			if (properties.multiplicador_fondo_audio) config.MULTIPLICADOR_FONDO_AUDIO = properties.multiplicador_fondo_audio.value;
			if (properties.grado_union_audio) config.GRADO_UNION_AUDIO = properties.grado_union_audio.value;
			if (properties.grado_union_mouse) config.GRADO_UNION_MOUSE = properties.grado_union_mouse.value;
			if (properties.multiplicador_impulso_normal) config.MULTIPLICADOR_IMPULSO_NORMAL = properties.multiplicador_impulso_normal.value;
			if (properties.multiplicador_impulso_audio) config.MULTIPLICADOR_IMPULSO_AUDIO = properties.multiplicador_impulso_audio.value;
			if (properties.tipo_objeto) config.TIPO_OBJETO = properties.tipo_objeto.value;
			if (properties.numero_pinchos) config.NUM_PINCHOS = properties.numero_pinchos.value;
			if (properties.multiplicador_radio_interior_estrella) config.MULTIPLICADOR_RADIO_INTERIOR_ESTRELLA = properties.multiplicador_radio_interior_estrella.value;
			if (properties.texto_custom) config.TEXTO_CUSTOM = properties.texto_custom.value;
			if (properties.radio_objeto)
			{
				config.RADIO_OBJETO = properties.radio_objeto.value;
				chains = [];
				for( var i = 0; i < chainCount; i++ ) {
					chains.push( new Chain() );
				}
			}
			if (properties.color_objeto_normal)
			{
				let c = properties.color_objeto_normal.value.split(" "),
                r = Math.floor(c[0]*255),
                g = Math.floor(c[1]*255),
                b = Math.floor(c[2]*255);
				
				config.COLOR_OBJETO_NORMAL.r = r;
				config.COLOR_OBJETO_NORMAL.g = g;
				config.COLOR_OBJETO_NORMAL.b = b;
			}
			if (properties.color_objeto_deteccion)
			{
				let c = properties.color_objeto_deteccion.value.split(" "),
                r = Math.floor(c[0]*255),
                g = Math.floor(c[1]*255),
                b = Math.floor(c[2]*255);
				
				config.COLOR_OBJETO_DETECCION.r = r;
				config.COLOR_OBJETO_DETECCION.g = g;
				config.COLOR_OBJETO_DETECCION.b = b;
			}
			if (properties.color_objeto_mouse)
			{
				let c = properties.color_objeto_mouse.value.split(" "),
                r = Math.floor(c[0]*255),
                g = Math.floor(c[1]*255),
                b = Math.floor(c[2]*255);
				
				config.COLOR_OBJETO_MOUSE.r = r;
				config.COLOR_OBJETO_MOUSE.g = g;
				config.COLOR_OBJETO_MOUSE.b = b;
			}
			if (properties.color_objeto_audio_multicolor) config.COLOR_OBJETO_AUDIO_MULTICOLOR = properties.color_objeto_audio_multicolor.value;
			if (properties.cambio_color_depende_audio) config.CAMBIO_COLOR_DEPENDE_AUDIO = properties.cambio_color_depende_audio.value;
			if (properties.cambio_color_constante_frecuencia) config.CAMBIO_COLOR_CONSTANTE_FRECUENCIA = properties.cambio_color_constante_frecuencia.value;
			if (properties.multiplicador_cambio_multicolor_audio) config.MULTIPLICADOR_CAMBIO_MULTICOLOR_AUDIO = properties.multiplicador_cambio_multicolor_audio.value;
			if (properties.color_objeto_audio)
			{
				let c = properties.color_objeto_audio.value.split(" "),
                r = Math.floor(c[0]*255),
                g = Math.floor(c[1]*255),
                b = Math.floor(c[2]*255);
				
				config.COLOR_OBJETO_AUDIO.r = r;
				config.COLOR_OBJETO_AUDIO.g = g;
				config.COLOR_OBJETO_AUDIO.b = b;
			}
        }
    };
	
	window.wallpaperRegisterAudioListener((audioArray) => {
			if (audioArray[0] > 5) return;

			let bass = 0.0;
			let half = Math.floor(audioArray.length / 2);

			for (let i = 0; i <= config.FRECUENCIA_RANGO; i++) {
				bass += audioArray[Math.max(0, Math.min((i + config.FRECUENCIA_RANGO_PRINCIPIO), (audioArray.length)-1))];
				bass += audioArray[Math.max(0, Math.min((half + (i + config.FRECUENCIA_RANGO_PRINCIPIO)), (audioArray.length)-1))];
			}
			bass /= (config.FRECUENCIA_RANGO * 2);
			sonido(Math.floor((bass * config.SENSIBILIDAD_AUDIO) * 10));
			
		});
});

resize();

for( var i = 0; i < chainCount; i++ ) {
	chains.push( new Chain() );
}

loop();
reset();

function sonido(cantidad)
{
	cant = cantidad;
}