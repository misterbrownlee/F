/** 
 * The main F namespace.
 *	
 * @property {Object} options	Options for all F components. Set F.options.debug=true to see debug messages.
 *@namespace 
*/
var F = F || {};

try {
	window['ƒ'] = F;
}
catch (err) {
	console.log("ƒ: could not set ƒ variable");
}

F.options = {
	debug: false,				// True to display debug messages
	precompiledTemplates: true	// False if you need Handlebars.template() called on your templates
};
