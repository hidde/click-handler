(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	else if (typeof exports === 'object') {
		module.exports = factory();
	}
	else {
		root.clickHandler = factory();
	}
}(this, function() {
	'use strict';

	var handlers = {};
	var config = {
		alwaysPreventDefault: false,
	};

	// are we cutting the mustard?
	if (typeof document === 'undefined' || typeof document.addEventListener === 'undefined') {
		return;
	}

	document.addEventListener('click', function(e) {
		var target = e.target;
		var handler;

		// traverse up the DOM until we find a data-handler attribute
		while (target && !handler) {
			handler = target.getAttribute('data-handler');
			if (!handler) {
				target = target.parentElement;
			}
		}

		// bail if no data-handler attribute was found
		if (!handler) {
			return;
		}

		// allow cmd/ctrl + click and shift + click on anchors for new tab/window
		if (target.nodeName.toLowerCase() === 'a' && (event.shiftKey || event.metaKey || event.ctrlKey)) {
			return true;
		}

		// fire the handler, passing `target` as `this`.
		if (typeof handlers[handler] === 'function') {
			if (config.alwaysPreventDefault === true) {
				event.preventDefault();
			}
			handlers[handler].call(target, event);
		}
	});

	var configure = function(arg) {
		if (!arg) {
			return;
		}
		config.alwaysPreventDefault = arg.alwaysPreventDefault || false;
	};

	var register = function(arg, fn) {
		var fnName;
		if (typeof arg === 'string' && typeof fn === 'function') {
			if (!handlers[arg]) {
				handlers[arg] = fn;
			}
		}
		else if (typeof arg === 'object' && typeof fn === 'undefined') {
			for (fnName in arg) {
				register(fnName, arg[fnName]);
			}
		}
	};

	var unregister = function(arg) {
		var fnName;
		if (arguments.length === 1) {
			if (typeof arg === 'string' && handlers[arg]) {
				delete(handlers[arg]);
			}
		}
		else if (arguments.length > 1) {
			for (fnName in arguments) {
				unregister(arguments[fnName]);
			}
		}
	};

	return {
		configure: configure,
		register: register,
		unregister: unregister
	};

}));