/**
 * Knockout.js extention for module organization
 * @param {Object} namespace - object with our modules
 * @returns {ViewModel} - instance of view model
 */
var dgKoModulizer = function (namespace) {
    var Utils = {
		isEmptyObject: function (obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},

		createNamespace: function (strName) {
	        var parts = strName.split('.'),
	            parent = window;

	        for (var i = 0, l = parts.length; i < l; i++) {
	            if (typeof parent[parts[i]] === 'undefined') {
	                parent[parts[i]] = {};
	            }

	            parent = parent[parts[i]];
	        }

	        return parent;
	    }, 

		/**
		 * Create constructor function from given properties.
		 *
		 * @param {Object} config Properties to be inserted in class prototype
		 * @param {Function} config.constructor Constructor function.
		 */
		createClass: function (config) {
		    var nativeConstructor = config.constructor || function () { },
		        proto = {}, // will be placed in prototype
		        properties = {}, // will be placed in new instance
		        val;

		    for (var key in config) {
		        if (!config.hasOwnProperty(key)) {
		            continue;
		        }
		        val = config[key];
		        (typeof val === 'function' ? proto : properties)[key] = val;
		    }

		    var constructor = Utils.isEmptyObject(properties)
		        ? nativeConstructor
		        : function() {
			        for (var k in properties) {
			            if (properties.hasOwnProperty(k)) {
			                this[k] = Utils.cloneObject(properties[k]);
			            }
		        	}
		        	nativeConstructor.apply(this, arguments);
		    	};

		    proto.constructor = constructor;
		    Utils.extend(constructor.prototype, proto, true);
		    return constructor;
		},

		/**
		 * Extending throw weak copying of properties.
		 *
		 * @param {Object} dst Target where properties will be copied to.
		 * @param {Object} mix Properties' source object. As many as you need.
		 * @param {Boolean} override True to allow overriding properties
		 */
		extend: function(dst, mix, override) {
		    override = override === true;

		    if (typeof dst !== 'object' && typeof dst !== 'function') {
		        throw new Error('Can not copy properties to nonobject');
		    }
		    var srcs = Array.prototype.slice.call(arguments, 1),
		        _doubles = [];

		    for (var q in srcs) {
		        var src = srcs[q];
		        for (var k in src) {
		            if (!src.hasOwnProperty(k)) {
		                continue;
		            }

		            if (dst.hasOwnProperty(k) && !override) {
		                _doubles.push(k);
		            } else {
		                dst[k] = src[k];
		            }
		        }
		    }

		    if (_doubles.length && !override) {
		        throw new Error('Can not redefine properties: ' + _doubles.join(', '));
		    }

		    return dst;
		},

		/**
		 * Clone object.
		 *
		 * @param o Object to be cloned.
		 * @return {*}
		 */
		cloneObject: function (o) {
		    if (typeof o !== 'object') {
		        return o;
		    }

		    var res = (o instanceof Array ? [ ] : { }),
		        val;

		    for (var key in o) {
		        if (!o.hasOwnProperty(key)) {
		            continue;
		        }
		        val = o[key];
		        res[key] = (val && typeof val === 'object')
		            ? arguments.callee(val)
		            : val;
		    }
		    return res;
		}
	};

	/**
	 * @class global view model for knockout.js bindings
	 */
	var ViewModel = Utils.createClass( /** @lends DG.Online.UI.ViewModel.prototype */ {

	    _modulesNS: namespace,

	    /**
	     * Prepare lazy getter for observable.
	     * Getter will be replaced by real observable as soon as first-time evaluated
	     *
	     * @param {string} name Observable's name
	     * @param {object} object Configuration object.
	     */
	    _prepareGetter: function(name, object) {
	        var t = typeof object;

	        /**
	         * Generate correct replacement (observable) depending on object's type.
	         * @param {object} scope
	         */
	        function replacer(scope) {
	            if (object instanceof Array) {
	                return ko.observableArray(object);
	            } else if (t === 'object' && object !== null && (object.read || object.write)) {
	                return ko.computed(Utils.extend(object, {
	                    owner: scope
	                }, true));
	            } else if (t === 'function') {
	                return ko.computed(object, scope);
	            } else {
	                return ko.observable(object);
	            }
	        }

	        var result = function () {
	            this[name] = replacer(this);
	        }.bind(this);
	        result._isReplacer = true;

	        return result;
	    },


	    /** @constructor  */
	    constructor: function() {

	        var initFuncs = [],
	            observables = {};

	        for (var k in this._modulesNS) {
	            if (!this._modulesNS.hasOwnProperty(k)) {
	                continue;
	            }

	            var module = this._modulesNS[k];

	            if (typeof module._initModule === 'function') {
	                initFuncs.push(module._initModule);
	                delete module._initModule;
	            }

	            if (typeof module._observables === 'object') {
	                try {
	                    Utils.extend(observables, module._observables);
	                    delete module._observables;
	                } catch (e) {
	                	console.log('Exception while copying observables: ' + e.message)
	                }
	            }

	            try {
	                // Copy all methods from module without _observables and _initModule
	                Utils.extend(this, module);
	            } catch (e) {
	            	console.log('Exception while extending ViewModel methods: ' + e.message);
	            }
	        }

	        // Create observables' replacement function.
	        for (var k in observables) {
	            if (observables.hasOwnProperty(k)) {
	                this[k] = this._prepareGetter(k, observables[k]);
	            }
	        }
	        
	        // Some observables can be accessed without trying to evaluating them. This can cause error.
	        // That's why we will call them.
	        for (var k in observables) {
	            if (observables.hasOwnProperty(k) && typeof this[k]._isReplacer !== 'undefined') {
	                this[k]();
	            }
	        }

	        // Initiate imported modules.
	        for (var i = 0; i < initFuncs.length; i++) {
	            initFuncs[i].call(this);
	        }
	    }
	});

	return new ViewModel();
};
