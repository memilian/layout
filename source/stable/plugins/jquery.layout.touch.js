/**
 * @preserve jquery.layout.state 1.2
 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $
 *
 * Copyright (c) 2010 
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 *	@dependancies: $.layout 1.3.0.rc30 or higher
 *
 * Docs: [ to come ]
 * Tips: [ to come ]
 * Help: http://groups.google.com/group/jquery-ui-layout
 */

// NOTE: For best readability, view with a fixed-width font and tabs equal to 4-chars

;(function ($) {

if (!$.layout) return;


// tell Layout that the state plugin is available
$.layout.plugins.touch = true;

/*
 *	State Managment methods
 */
$.layout.touch = {
	// set data used by multiple methods below
	config: {
		borderPanes:	"north,south,west,east"
	}

	/**
	*
	* @see  _create()
	*/
,	init: function (inst) {
		// if browser is not Touch enabled, then exit
		if (!'ontouchend' in document) return;
		$.each(inst.resizers, function(k,v){
			if (v !== false) v
				.bind('touchstart',	function (evt) { return $.layout.touch.start(evt, inst, this); }) 
				.bind('touchmove',	function (evt) { return $.layout.touch.move(evt, inst, this); }) 
				.bind('touchend',	function (evt) { return $.layout.touch.end(evt, inst, this); }) 
				.bind('touchcancel',function (evt) { return $.layout.touch.end(evt, inst, this); }) 
		});
	}

,	start: function (evt, inst, elem) {
		var	$R		= $(elem)
		,	p		= $R.data('layoutEdge')
		,	o		= inst.options[p]
		,	s		= inst.state[p]
		,	base	= o.resizerClass
		,	resizerClass		= base+"-dragging"				// resizer-drag
		,	resizerPaneClass	= base+"-"+p+"-dragging"		// resizer-north-drag
		;
		s.touchDragStart = 0;
		if (s.isClosed || !o.resizable) return; 
		// Touch: ignore all but single touch events 
		var e = evt.originalEvent;
		if (!e.touches || e.touches.length != 1) return; 
		// SET RESIZER LIMITS - used in drag() 
		inst.setSizeLimits(p); // update pane/resizer state 
		inst.showMasks(p, { resizing: true });
		$R.addClass(resizerClass +" "+ resizerPaneClass); 
		r = s.resizerPosition; 
		s.isResizing = true; 
	}

,	move: function (evt, inst, elem) {
		var	$R	= $(elem)
		,	p	= $R.data('layoutEdge')
		,	o	= inst.options[p]
		,	s	= inst.state[p]
		,	e	= evt.originalEvent
		,	t	= e.touches
		,	vert = p.match(/(east|west)/)
		;
		if (s.isClosed || !o.resizable) return; 
		if (!t || t.length != 1) return; 
		e.preventDefault();  // Touch: prevent scrolling
		var offset = $R.offsetParent().offset();
		pos = vert ? t[0].pageX - offset.left : t[0].pageY - offset.top; 
		pos = Math.min( Math.max(pos, r.min), r.max );
		// Touch: for simplicity, move the actual resizer div, not a clone 
		$R.css((vert ? 'left' : 'top'), pos); 
		s.touchDragStart = pos;
	}

,	end: function (evt, inst, elem) {
		var	$R	= $(elem)
		,	p	= $R.data('layoutEdge')
		,	o	= inst.options[p]
		,	s	= inst.state[p]
		,	e	= evt.originalEvent
		,	t	= e.touches
		,   _c	= $.layout.config
		,   sC  = inst.state.container
		,	pos	= s.touchDragStart 
		,	vert = p.match(/(east|west)/)
		,	base	= o.resizerClass
		,	resizerClass		= base+"-dragging"				// resizer-drag
		,	resizerPaneClass	= base+"-"+p+"-dragging"		// resizer-north-drag
		;
		if (s.isClosed || !o.resizable) return; 
		$R.removeClass(resizerClass +" "+ resizerPaneClass); // remove drag classes from Resizer
		if (!pos) return;
		var c   = _c[p], resizerPos; 
		// Touch: reset the resizer's top/left style that we set above during drag, 
		// else it remains stuck in place if the pane is later closed 
		$R.css((vert ? 'left' : 'top'), ''); 
		// Touch: following code inspired by resizePanes() subroutine 
		switch (p) { 
			case "north": resizerPos = pos; break; 
			case "west":  resizerPos = pos; break; 
			case "south": resizerPos = sC.layoutHeight - pos - o.spacing_open; break; 
			case "east":  resizerPos = sC.layoutWidth  - pos - o.spacing_open; break; 
		}
		// remove container margin from resizer position to get the pane size 
		var newSize = resizerPos - sC.inset[c.side]; 
		inst._sizePane(p, newSize); 
		inst.hideMasks(p);
		s.isResizing = false; 
		s.touchDragStart = 0;
	}
	
,	_load: function (inst) {
		$.layout.touch.init(inst);
	}

,	_unload: function (inst) {
	}

};


// add state initialization method to Layout's onCreate array of functions
$.layout.onReady.push( $.layout.touch._load );
$.layout.onUnload.push( $.layout.touch._unload );

})( jQuery );