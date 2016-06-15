'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
// THis version uses and returns promises where appropriate. this makes
// decorating much easier as well (pre and post processing)
//
// =========================================================================
var mongoose = require ('mongoose');
var _        = require ('lodash');
var access   = require ('./cc.access.controller');

var emptyPromise = function (t) {return new Promise (function (r, e) { r (t); }); };

// -------------------------------------------------------------------------
//
// opts is expected to have user, context, and userRoles
//
// -------------------------------------------------------------------------
var DBModel = function (opts) {
	this._init (opts);
};
DBModel.extend = require ('./cc.extend.controller');

_.extend (DBModel.prototype, {
	//
	// these are all the things that can be extended form the base
	//
	name             : 'Project',     // required : name of the model
	baseQuery        : {},            // optional : base query to be applied to all queries
	decorate         : emptyPromise,  // optional : extra decoration function
	preprocessAdd    : emptyPromise,  // optional : pre-processing
	postprocessAdd   : emptyPromise,  // optional : post-processing
	preprocessUpdate : emptyPromise,  // optional : pre-processing
	postprocessUpdate: emptyPromise,  // optional : post-processing
	populate         : '',            // optional : populate clause for all queries
	sort             : '',            // optional : sort clause for all queries
	decorateCollection : true,       // optional : decorate collections as well as singles ?
	// -------------------------------------------------------------------------
	//
	// initialize
	//
	// -------------------------------------------------------------------------
	_init : function (opts) {
		this.opts       = opts;
		this.user       = opts.user;
		this.context    = opts.context   || 'application';
		this.userRoles  = opts.userRoles || [];
		this.isAdmin    = false;
		this.roles      = [];
		// console.log ('new ', this.name);
		// console.log ('this.user      = ', this.user     );
		// console.log ('this.context   = ', this.context  );
		// console.log ('this.userRoles = ', this.userRoles);
		//
		// keep a pointer to mongoose, and set our local schema/model
		//
		this.mongoose   = mongoose;
		this.model      = mongoose.model (this.name);
		this.err        = (!this.model) ? new Error ('Model not provided when instantiating ESM Model') : false;
		//
		// this will tell us whether or not to set the audit fileds on save
		//
		this.useAudit   = _.has (this.model.schema.methods, 'setAuditFields');
		//
		// this will let us know whether or not to use the security stuff
		//
		this.useRoles   = _.has (this.model.schema.methods, 'unpublish');
		//
		// a function pointer to either the real or fake decorator
		//
		this.permissions = (this.useRoles) ? this.decoratePermission : emptyPromise;
		//
		// bind everything we want to use out of context
		//
		_.bindAll (this, [
			'findById',
			'findMany',
			'saveDocument',
			'saveAndReturn',
			'setDocument',
			'newDocument',
			'deleteDocument',
			'decorateAll',
			'addPermissions',
			'decoratePermission',
			'permissions',
			'preprocessAdd',
			'preprocessUpdate',
			'create',
			'findAndUpdate',
			'newFromObject'
		]);
		//
		// allows the extended classes to also bind
		//
		if (this.bind) _.bindAll (this, this.bind);
		this.filter      = {};
		this.resetAccess = false;
		this.force       = false;
		//
		// this is called seperately so that the user can be reset during other processing
		// if required
		//
		this.setUserRoles (this.opts);
		//
		// run the custom init if provided
		//
		this.init ();
	},
	init: function () {},
	setForce: function (value) { this.force = value; },
	// -------------------------------------------------------------------------
	//
	// set the base query to be used for all methods, this applies filtering
	// for access, or whatever is needed. It starts with the baseQuery at
	// root, then adds access control if specified. the default root base
	// query is empty, and it can be either an object or a function that
	// returns an object
	//
	// access parameter is 'read' or 'write'
	//
	// -------------------------------------------------------------------------
	setBaseQ : function (accessQuery) {
		accessQuery = accessQuery || this.filter.read;
		this.baseQ = (_.isFunction (this.baseQuery)) ? this.baseQuery.call (this) : _.cloneDeep (this.baseQuery);
		//
		// for an admin we don't apply access control, so only continue
		// if not admin, and don't continue if the model doesn't use
		// access control either. extend the base Q with the access Q
		//
		if (this.useRoles && !this.isAdmin) {
			_.extend (this.baseQ, accessQuery);
		}
		// console.log ('my roles are:', this.roles);
		// console.log ('base query is:', this.baseQ);
	},
	// -------------------------------------------------------------------------
	//
	// sets up everything to do with roles, filtering queries, security, etc.
	// seperate call from 'new' so that context may be changed mid-processing
	// by caller
	//
	// -------------------------------------------------------------------------
	setUserRoles: function (opts) {
		//
		// do some silly stuff to ensure that we have a set of roles from the
		// user object
		//
		this.user = opts.user || {roles:[]};
		var roles = opts.user.roles ? opts.user.roles : [];
		//
		// set whether or not we are admin to make things easier later
		//
		this.isAdmin = !!~roles.indexOf ('admin');
		//
		// set the total set of roles as the user roles plus the contextual
		// roles
		//
		this.roles = roles.concat (opts.userRoles);
		//
		// always add in the public role as this is universal
		//
		this.roles.push ('public');
		console.log ("this.roles = ", this.roles);
		//
		// set up the read, write, delete filters so we dont have to keep doing it
		//
		this.filter = {
			'read'   : { read   : { $in : this.roles } },
			'write'  : { write  : { $in : this.roles } },
			'delete' : { delete : { $in : this.roles } }
		};
		this.setAccess ('read');
	},
	// -------------------------------------------------------------------------
	//
	// this is kept for backwards compatability with the original dbmodel
	//
	// -------------------------------------------------------------------------
	setUser : function (user) {
		this.setUserRoles ({
			user      : user,
			context   : this.context,
			userRoles : this.userRoles
		});
	},
	// -------------------------------------------------------------------------
	//
	// this can be used to set the access filter for a query, then set it
	// back again, its just a nice shorthand. val is read or write or delete
	//
	// -------------------------------------------------------------------------
	setAccess: function (val) {
		var accessQuery = this.filter[val];
		this.baseQ = (_.isFunction (this.baseQuery)) ? this.baseQuery.call (this) : _.cloneDeep (this.baseQuery);
		//
		// for an admin we don't apply access control, so only continue
		// if not admin, and don't continue if the model doesn't use
		// access control either. extend the base Q with the access Q
		//
		if (this.useRoles && !this.isAdmin) {
			_.extend (this.baseQ, accessQuery);
		}
		// console.log ('my roles are:', this.roles);
		// console.log ('base query is:', this.baseQ);
	},
	setAccessOnce: function (val) {
		// console.log ('setting access ONCE ',val);
		this.resetAccess = true;
		this.setAccess (val);
	},
	hasPermission : function (userRoles, targetRoles) {
		return (this.isAdmin || (_.intersection (userRoles, targetRoles).length > 0));
	},
	// -------------------------------------------------------------------------
	//
	// this function returns a promise using the find by Id method. It has an
	// optional populate as well. this is assumed blank unless otherwise passed in
	// it aslo deals woith permissions on the actual object, adding this to the
	// query if required
	//
	// -------------------------------------------------------------------------
	findById : function (id) {
		return this.findOne ({_id : id});
	},
	// -------------------------------------------------------------------------
	//
	// this function returns a promise using the find by Id method. It has an
	// optional populate as well. this is assumed blank unless otherwise passed in
	// it aslo deals woith permissions on the actual object, adding this to the
	// query if required
	//
	// -------------------------------------------------------------------------
	findOne : function (query, fields) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			console.log ('q = ',q);
			self.model.findOne (q)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// returns a promise, takes optional query, sort and populate
	//
	// -------------------------------------------------------------------------
	findMany : function (query, fields) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			// console.log ('q.$or = ',q.$or[0].read);
			self.model.find (q)
			.sort (self.sort)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	findFirst : function (query, fields, sort) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			// console.log ('q = ',q);
			self.model.find (q)
			.sort (sort)
			.limit (1)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	findFirstOne : function (query, fields, sort) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst (query, fields, sort).then (function (a) {
				if (a && a.length > 0) return a[0];
				else return null;
			})
			.catch (resolve, reject);
		});
	},
	findAndUpdate : function (obj) {
		var self = this;
	// console.log (JSON.stringify (obj, null, 4));
		return new Promise (function (resolve, reject) {
			self.model.findOne ({_id:obj._id}, function (err, doc) {
				// console.log ("DOC:",doc);
				if (doc) {
					doc.set (obj);
					doc.save ().then (resolve, reject);
				} else {
					resolve(obj);
				}
			});
		});
	},
	newFromObject: function (obj) {
		var self = this;
		// console.log (self.name +' newthing = ', obj);
		var m = new self.model (obj);
		return this.saveDocument (m);
	},
	// -------------------------------------------------------------------------
	//
	// set role permissions on an object
	//
	// -------------------------------------------------------------------------
	// -------------------------------------------------------------------------
	//
	// save a document, but only if the user has write permission
	//
	// -------------------------------------------------------------------------
	saveDocument : function (doc) {
		var self = this;
		// console.log ('in saveDocument with doc ',doc);
		// console.log ('in saveDocument with roles ',self.roles);
		return new Promise (function (resolve, reject) {
			if (!self.force && self.useRoles && !self.hasPermission (self.userRoles, doc.write)) {
				return reject (new Error ('Write operation not permitted for this '+self.name+' object'));
			}
			if (self.useAudit) doc.setAuditFields (self.user);
			doc.save ().then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set a document with new values
	//
	// -------------------------------------------------------------------------
	setDocument : function (doc, values) {
		return new Promise (function (resolve, reject) {
			resolve (doc.set (values));
		});
	},
	// -------------------------------------------------------------------------
	//
	// make a new blank document (optionally use the passed in object to make it)
	//
	// -------------------------------------------------------------------------
	newDocument : function (o) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var m = new self.model (o);
			if (!m) return reject (new Error ('Cannot create new '+self.name));
			return resolve (m);
		});
	},
	// -------------------------------------------------------------------------
	//
	// delete with a promise
	//
	// -------------------------------------------------------------------------
	deleteDocument : function (doc) {
		return new Promise (function (resolve, reject) {
			doc.remove ().then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// Decorate an entire array, returns a promise which resolves the array
	//
	// -------------------------------------------------------------------------
	decorateAll : function (models) {
		var self = this;
		return Promise.all (models.map (self.decorate));
	},
	// -------------------------------------------------------------------------
	//
	// fill out the userPermissions field in the model. this will be different
	// for different users
	//
	// -------------------------------------------------------------------------
	addPermissions : function (model) {
		var self = this;
		// console.log ('gathering permissions for ',{
		// 		context  : self.context,
		// 		user     : self.user.username,
		// 		resource : model._id
		// 	});
		//
		return new Promise (function (resolve, reject) {
			self.isAdmin = true;
			if (self.isAdmin) {
				_.each (model._doc.userCan, function (val, key) {
					model.userCan[key] = true;
				});
				resolve (model);
			}
			else {
				access.userPermissions ({
					context  : self.context,
					user     : self.user.username,
					resource : model._id
				})
				.then (function (ps) {
					console.log ('ps', ps);
					ps.map (function (perm) {
						model.userCan[perm] = true;
					});
					model.userCan.read = self.hasPermission (self.roles, model.read);
					model.userCan.write = self.hasPermission (self.roles, model.write);
					model.userCan.delete = self.hasPermission (self.roles, model.delete);
					return model;
				})
				.then (resolve, reject);
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// decorate the results with the user's permission
	//
	// -------------------------------------------------------------------------
	decoratePermission : function (models) {
		var self = this;
		console.log ('roles', self.roles);
		if (_.isArray (models)) {
			return self.decorateCollection ? (Promise.all (models.map (self.addPermissions))) : models;
		} else {
			return new Promise (function (resolve, reject) {
				// console.log ('decorating single with permissions');
				resolve (self.addPermissions (models));
			});
		}
	},
	// -------------------------------------------------------------------------
	//
	// given a model, set/add/delete permissions for roles. the definition looks
	// like this:
	// {
	// 	permission : [role array],
	// 	permission : [role array],
	// }
	// //
	// -------------------------------------------------------------------------
	setModelPermissions : function (model, definition) {
		//
		// this sets permissions exactly as specified
		//
		model.read   = [];
		model.write  = [];
		model.delete = [];
		var self = this;
		return access.deleteAllPermissions ({
			resource: model._id
		})
		.then (function () {
			return self.addModelPermissions (model, definition);
		});
	},
	addModelPermissions : function (model, definition) {
		//
		// this merges new permissions into the old
		//
		var resource = model._id;
		model.addRoles ({
			read   : definition.read,
			write  : definition.write,
			delete : definition.delete
		});
		var promiseArray = [model.save ()];
		_.each (definition, function (roles, permission) {
			promiseArray.push (access.addPermissions ({
				resource    : resource,
				permissions : [ permission ],
				roles       : roles
			}));
		});
		return Promise.all (promiseArray);
	},
	deleteModelPermissions : function (model, definition) {
		//
		// this removes permissions as specified
		//
		model.removeRoles ({
			read   : definition.read,
			write  : definition.write,
			delete : definition.delete
		});
		var promiseArray = [model.save ()];
		_.each (definition, function (roles, permission) {
			promiseArray.push (access.deletePermissions ({
				resource    : model._id,
				permissions : [ permission ],
				roles       : roles
			}));
		});
		return Promise.all (promiseArray);
	},
	// -------------------------------------------------------------------------
	//
	// make a new copy from a passed in object
	//
	// -------------------------------------------------------------------------
	copy : function (obj) {
		var copy = (obj.toObject) ? obj.toObject () : obj;
		delete copy._id;
		return this.newDocument (copy);
	},
	// =========================================================================
	//
	// the next ones all deal with request actions, they all return a function
	// with requst and response as parameters
	//
	// =========================================================================
	saveAndReturn : function (doc) {
		var self = this;
		// console.log ('in save and return with ',doc, self);
		return new Promise (function (resolve, reject) {
			self.saveDocument (doc)
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// this is when we need to ensure that the provided code is in fact unique
	// perform a simple recursive routine that appends different suffixes until
	// one is unique
	//
	// -------------------------------------------------------------------------
	guaranteeUniqueCode : function (code) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findUniqueCode (code, '', function (err, newcode) {
				if (err) return reject (err);
				else resolve (newcode);
			});
		});
	},
	findUniqueCode: function (code, suffix, callback) {
		var self = this;
		var trialCode = code + (suffix || '');
		self.model.findOne ({code:trialCode}, function (err, result) {
			if (!err) {
				if (!result) {
					callback (null, trialCode);
				} else {
					return self.findUniqueCode (code, (suffix || 0) + 1, callback);
				}
			} else {
				callback (err, null);
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// POST
	// has optional preprocess and decorate (postprocess)
	// these assume that the object being saved already has an Id (it was made
	// first with new)
	//
	// -------------------------------------------------------------------------
	create : function (obj) {
		var self = this;
		// console.log ('creating', obj.code);
		return new Promise (function (resolve, reject) {
			self.newDocument (obj)
			.then (self.preprocessAdd)
			.then (self.saveDocument)
			.then (self.permissions)
			.then (self.postprocessAdd)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// PUT
	// same as POST except that we should have the original in the request as
	// it would appear in the URL. we then 'set' the differences
	//
	// -------------------------------------------------------------------------
	update : function (oldDoc, newDoc) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.setDocument (oldDoc, newDoc)
			.then (self.preprocessUpdate)
			.then (self.saveDocument)
			.then (self.permissions)
			.then (self.postprocessUpdate)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// DELETE
	//
	// -------------------------------------------------------------------------
	delete : function (doc) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.deleteDocument (doc)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET NEW (decorate must return a promise)
	//
	// -------------------------------------------------------------------------
	new : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.newDocument ()
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET
	// in the case that this was already on the URL (which it is) the object
	// will already exist in the request under its name
	//
	// -------------------------------------------------------------------------
	read : function (model) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.permissions (model)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	list : function (q, f) {
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		console.log ('got here man');
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	one : function (q, f) {
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findOne (q, f)
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *, but just those that we have write access to. this will not make
	// sense in some contexts, just those where we are using the access control
	//
	// -------------------------------------------------------------------------
	listwrite : function (q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		if (_.has (this.model.schema.paths, 'dateCompleted')) {
			q.dateCompleted = { "$eq": null };
		}
		this.setAccessOnce ('write');
		q = _.extend ({}, this.baseQ, q);
		// console.log ('q = ', JSON.stringify(q,null,4));
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (resolve, reject);
		});
	}
});

module.exports = DBModel;