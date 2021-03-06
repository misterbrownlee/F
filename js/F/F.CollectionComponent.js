F.CollectionComponent = new Class(/** @lends F.CollectionComponent# */{
	toString: 'CollectionComponent',
	extend: F.Component,
	
	/**
	 * A component that can load and render a collection
	 *
	 * @constructs
	 * @extends F.Component
	 *
	 * @param {Object} options							Options for this component
	 * @param {Backbone.Collection} options.Collection	The collection class this component should operate on. Sets this.Collection
	 * @param {Object} [options.defaultParams ]			Default parameters to use when fetching this collection
	 *
	 * @property {Object} defaultParams				Default parameters to send with fetches for this collection. Can be overridden at instantiation. Calls to load(fetchParams) will merge fetchParams with defaultParams.
	 * @property {Backbone.Collection} Collection	The collection class to operate on. Not an instance of a collection, but the collection class itself.
	 */
	construct: function(options) {
		// Store the collection class
		this.setPropsFromOptions(options, [
			'Collection'
		]);
		
		// Bind for use as listeners
		this.bind(this.addModel);
		this.bind(this.removeModel);
		this.bind(this.render);
		
		this._useCollection(new this.Collection());
		
		// Default parameters are the prototype params + options params
		this.defaultParams = _.extend({}, this.defaultParams, options.defaultParams);
		
		// Parameters to send with the request: just copy the default params
		this.params = _.extend({}, this.defaultParams);
	
		// Store if this collection has ever been loaded
		this.collectionLoaded = false;
	},
	
	destruct: function() {
		this._releaseCollection();
	},
	
	Collection: Backbone.Collection,
	
	_useCollection: function(collection) {
		// Store collection
		this.collection = collection;
		
		// Re-render when the collection is fetched, items are added or removed
		this.collection.on('add', this.addModel);
		this.collection.on('remove', this.removeModel);
		this.collection.on('loaded', this.render); // custom event we call after fetches
		// this.collection.on('change', this.render); // Don't re-render on change! let the sub-views do that
	},
	
	_releaseCollection: function() {
		// Unbind events
		this.collection.off('add', this.addModel);
		this.collection.off('remove', this.removeModel);
		this.collection.off('loaded', this.render); // custom event we call after fetches
		
		// Remove reference to collection
		this.collection = null;
	},
	
	/**
	 * Refresh this collection with the last parameters used
	 *
	 * @param {Function} callback	Optional callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	refresh: function(callback) {
		// Just fetch the collection with the current params
		this.fetch(this.params, callback);
		
		return this;
	},
	
	/**
	 * Callback called when model is added to collection
	 */
	addModel: function(model) {},
	
	/**
	 * Callback called when model is removed from collection
	 */
	removeModel: function(model) {},
	
	/**
	 * Clear the parameters from the last fetch. Useful when using refresh() on a filtered list.
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	clearParams: function() {
		this.params = {};
		
		return this;
	},
	
	/**
	 * Fetch the collection by fetching it from the server
	 *
	 * @param {Object} [fetchParams]	Parameters to pass when fetching
	 * @param {Function} [callback]		Callback to execute on successful fetch
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	fetch: function(fetchParams, callback) {
		// Combine new params, if any, with defaults and store, overwriting previous params
		if (fetchParams)
			this.params = _.extend({}, this.defaultParams, fetchParams);
		else // Overwrite old params with defaults and send a request with only default params
			this.params = _.extend({}, this.defaultParams);
		
		// Fetch collection contents
		this.collection.fetch({
			data: this.params,
			success: function() {
				// Collection event
				this.collection.trigger('loaded');

				// Component event
				this.trigger('collection:loaded', this.collection);
				this.collectionLoaded = true;
				
				if (typeof callback === 'function')
					callback.call(this, this.collection);
			}.bind(this)
		});
		
		return this;
	},
	
	
	/**
	 * Load a Backbone.Collection directly or create a collection from an array of data
	 *
	 * @param {mixed} collectionOrData	Backbone.Collection to load or Array of Objects with data to create the collection from
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	load: function(collectionOrData) {
		this._releaseCollection();

		if (collectionOrData instanceof Backbone.Collection)
			this._useCollection(collectionOrData);
		else
			this._useCollection(new this.Collection(collectionOrData));
		
		return this;
	},
	
	
	/**
	 * Show this component. Provide options.params to fetch with new parameters. The collection will be fetched before showing if it hasn't already
	 *
	 * @param {Object} options	Pass fetch parameters with options.params
	 *
	 * @returns {F.CollectionComponent}	this, chainable
	 */
	show: function(options) {
		options = options || {};
		if (options.params) {
			// Fetch the collection from the server
			this.fetch(options.params, function() {
				this.show({
					silent: options.silent
				});
			});
		}
		else if (!this.collectionLoaded) {
			// Perform initial load
			this.refresh(function() {
				this.show({
					silent: options.silent
				}); // show when we're fully loaded
			});
		}
		else
			this.inherited(arguments);
		
		return this;
	}
	
	
	/**
	 * Triggered when the collection is loaded from the server
	 *
	 * @name F.CollectionComponent#collection:loaded
	 * @event
	 *
	 * @param {Backbone.Collection}	collection	The collection that was loaded
	 */
});
