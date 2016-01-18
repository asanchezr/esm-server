'use strict';
// =========================================================================
//
// Controller for roles
//
// =========================================================================
var path       = require('path');
var mongoose   = require ('mongoose');
var CRUD       = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var RoleObject = mongoose.model ('RoleObject');
var Role = mongoose.model ('Role');
var _          = require ('lodash');

// -------------------------------------------------------------------------
//
// get roleobjects (return non-mongoose promise)
//
// -------------------------------------------------------------------------
var getRoleObjects = function (search) {
	return new Promise (function (resolve, reject) {
		RoleObject.find (search).exec().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// get roleobjects count (return non-mongoose promise)
//
// -------------------------------------------------------------------------
var getRoleObjectsCount = function (search) {
	return new Promise (function (resolve, reject) {
		RoleObject.count (search, function (err, c) {
			if (err) return reject (err);
			resolve (c);
		});
	});
};
// -------------------------------------------------------------------------
//
// a permission set is defined as the following:
// {
// 	read : ['group code'],
// 	write : ['group code'],
//  submit: ['group code'],
// 	watch : ['group code']
// }
// we run through these, gather the appropriate roles, return
// { role:{watch:false, permission:'none'} }
//
// -------------------------------------------------------------------------
var collapsePermissionSet = function (permissionSet) {
	var p = {};
	_.each (permissionSet.watch, function (code) {
		p[code] = {watch:true, permission:'none'};
	});
	_.each (permissionSet.read, function (code) {
		if (!p[code]) p[code] = {watch:false, permission:'none'};
		p[code].permission = 'read';
	});
	_.each (permissionSet.write, function (code) {
		if (!p[code]) p[code] = {watch:false, permission:'none'};
		p[code].permission = 'write';
	});
	_.each (permissionSet.submit, function (code) {
		if (!p[code]) p[code] = {watch:false, permission:'none'};
		p[code].permission = 'submit';
	});
	return p;
};
// -------------------------------------------------------------------------
//
// the reverse of the collapse, given  query result build the permissionSet
//
// -------------------------------------------------------------------------
var buildPermissionSet = function (qr) {
	var p = {
		read : [],
		write: [],
		submit: [],
		watch: []
	};
	qr.map (function (o) {
		if (p[o.permision]) p[o.permision].push (o.role);
		if (o.watch) p.watch.push (o.role);
	});
	return p;
};
// -------------------------------------------------------------------------
//
// just save the role object returning a promise
//
// -------------------------------------------------------------------------
var saveRoleObject = function (roleobj) {
	return new Promise (function (resolve, reject) {
		roleobj.save ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// more complicated, take an entire permission set and compile it into
// the set of permissions for this object, then set each row required
// for the set.  First delete ALL permissions on the object
//
// -------------------------------------------------------------------------
var setPermissions = function (stream, project, activity, permissionSet) {
	return new Promise (function (resolve, reject) {
		var p = collapsePermissionSet (permissionSet);
		RoleObject.find ({
			stream   : stream,
			project  : project,
			activity : activity
		}).remove (function (err) {
			if (err) return reject (err);
			var rolesArray = [];
			_.each (p, function (o, code) {
				rolesArray.push (saveRoleObject (new RoleObject ({
					rolecode   : code,
					stream     : stream,
					project    : project,
					activity   : activity,
					permission : o.permission,
					watch      : o.watch
				})));
			});
			Promise.all (rolesArray).then (resolve, reject);
		});
	});
};
// -------------------------------------------------------------------------
//
// do the entore permission set for a specific object, returns promise
//
// -------------------------------------------------------------------------
var streamPermissions = function (stream, permissionSet) {
	return setPermissions (stream, null, null, permissionSet);
};
var projectPermissions = function (project, permissionSet) {
	return setPermissions (null, project, null, permissionSet);
};
var activityPermissions = function (activity, permissionSet) {
	return setPermissions (null, null, activity, permissionSet);
};
var streamActivityPermissions = function (stream, activity, permissionSet) {
	return setPermissions (stream, null, activity, permissionSet);
};
var projectActivityPermissions = function (project, activity, permissionSet) {
	return setPermissions (null, project, activity, permissionSet);
};
// -------------------------------------------------------------------------
//
// set one permission for a given object, returns a promise
//
// -------------------------------------------------------------------------
var setPermission = function (role, stream, project, activity, permission) {
	return new Promise (function (resolve, reject) {
		//
		// find the existing
		//
		RoleObject.findOne ({
			rolecode   : role,
			stream     : stream,
			project    : project,
			activity   : activity
		}, function (err, roleobj) {
			if (err) return reject (err);
			//
			// if exists, update it else create one
			//
			if (roleobj) roleobj.permission = permission;
			else roleobj = new RoleObject ({
				rolecode   : role,
				stream     : stream,
				project    : project,
				activity   : activity,
				permission : permission,
				watch      : false
			});
			//
			// save it and trigger the promise
			//
			saveRoleObject (roleobj).then (resolve, reject);
		});
	});
};
// -------------------------------------------------------------------------
//
// do the permission for a specific object, returns promise
//
// -------------------------------------------------------------------------
var streamPermission = function (stream, role, permission) {
	return setPermission (role, stream, null, null, permission);
};
var projectPermission = function (project, role, permission) {
	return setPermission (role, null, project, null, permission);
};
var activityPermission = function (activity, role, permission) {
	return setPermission (role, null, null, activity, permission);
};
var streamActivityPermission = function (stream, activity, role, permission) {
	return setPermission (role, stream, null, activity, permission);
};
var projectActivityPermission = function (project, activity, role, permission) {
	return setPermission (role, null, project, activity, permission);
};
// -------------------------------------------------------------------------
//
// set one watch for a given object, returns a promise
//
// -------------------------------------------------------------------------
var setWatch = function (role, stream, project, activity, watch) {
	return new Promise (function (resolve, reject) {
		//
		// find the existing
		//
		RoleObject.findOne ({
			rolecode   : role,
			stream     : stream,
			project    : project,
			activity   : activity
		}, function (err, roleobj) {
			if (err) return reject (err);
			//
			// if exists, update it else create one
			//
			if (roleobj) roleobj.watch = watch;
			else roleobj = new RoleObject ({
				rolecode   : role,
				stream     : stream,
				project    : project,
				activity   : activity,
				permission : 'none',
				watch      : watch
			});
			//
			// save it and trigger the promise
			//
			saveRoleObject (roleobj).then (resolve, reject);
		});
	});
};
// -------------------------------------------------------------------------
//
// do the permission for a specific object, returns promise
//
// -------------------------------------------------------------------------
var streamWatch = function (stream, role, watch) {
	return setWatch (role, stream, null, null, watch);
};
var projectWatch = function (project, role, watch) {
	return setWatch (role, null, project, null, watch);
};
var activityWatch = function (activity, role, watch) {
	return setWatch (role, null, null, activity, watch);
};
var streamActivityWatch = function (stream, activity, role, watch) {
	return setWatch (role, stream, null, activity, watch);
};
var projectActivityWatch = function (project, activity, role, watch) {
	return setWatch (role, null, project, activity, watch);
};
// -------------------------------------------------------------------------
//
// Get the watch list for a given object
//
// -------------------------------------------------------------------------
var getWatch = function (stream, project, activity) {
	return new Promise (function (resolve, reject) {
		getRoleObjects ({
			stream     : stream,
			project    : project,
			activity   : activity,
			watch      : true
		})
		.then (function (list) {
			resolve (list.map (function (a) {return a.role;}));
		})
		.catch (reject);
	});
};
var getStreamWatch = function (stream) { return getWatch (stream, null, null); };
var getProjectWatch = function (project) { return getWatch (null, project, null); };
var getActivityWatch = function (activity) { return getWatch (null, null, activity); };
var getStreamActivityWatch = function (stream, activity) { return getWatch (stream, null, activity); };
var getProjectActivityWatch = function (project, activity) { return getWatch (null, project, activity); };
// -------------------------------------------------------------------------
//
// Get the permission list for a given object
//
// -------------------------------------------------------------------------
var getPermissions = function (stream, project, activity) {
	return new Promise (function (resolve, reject) {
		getRoleObjects ({
			stream     : stream,
			project    : project,
			activity   : activity
		})
		.then (function (list) {
			resolve (buildPermissionSet (list));
		})
		.catch (reject);
	});
};
var getStreamPermissions = function (stream) { return getPermissions (stream, null, null); };
var getProjectPermissions = function (project) { return getPermissions (null, project, null); };
var getActivityPermissions = function (activity) { return getPermissions (null, null, activity); };
var getStreamActivityPermissions = function (stream, activity) { return getPermissions (stream, null, activity); };
var getProjectActivityPermissions = function (project, activity) { return getPermissions (null, project, activity); };
// -------------------------------------------------------------------------
//
// given a role, get all projects it has access to or watches on
//
// -------------------------------------------------------------------------
var getRoleProjectPermissions = function (role) {
	return new Promise (function (resolve, reject) {
		getRoleObjects ({
			stream     : null,
			activity   : null
		});
	});
};
// -------------------------------------------------------------------------
//
// given a role, get all of its (real) object permissions
//
// projects: [{permission:'read', watch:true, _id:id, name:name}]
// activities: [{permission:'read', watch:true, _id:id, name:name, project:id}]
//
// -------------------------------------------------------------------------
var getRoleObjectPermissions = function (role) {
	return new Promise (function (resolve, reject) {

	});
};
// -------------------------------------------------------------------------
//
// given a set of roles and an object, return the permissions possible
//
// -------------------------------------------------------------------------
var getPermissionsForRoles = function (roles, project, activity) {
	return new Promise (function (resolve, reject) {
		getRoleObjects ({
			role       : { $in: roles },
			stream     : null,
			project    : project,
			activity   : activity
		})
		.then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// given a set of roles and an object, return the permissions possible as a
// set of booleans {read:true, write:true, submit:false, watch:false}
//
// -------------------------------------------------------------------------
var getPermissionSetForRoles = function (roles, project, activity) {
	return new Promise (function (resolve, reject) {
		getPermissionsForRoles (roles, project, activity)
		.then (function (set) {
			var p = {
				read: false,
				write: false,
				submit: false,
				watch: false
			};
			_.each (set, function (o) {
				p[o.permission] = true;
				p.watch = p.watch || o.watch;
			});
			delete p.none;
			p.write = p.write || p.submit;
			p.read = p.read || p.write;
		})
		.catch (reject);
	});
};
// -------------------------------------------------------------------------
//
// given a set of roles and an object, check specific permissions
//
// -------------------------------------------------------------------------
var canDoSomething = function (roles, project, activity, permission) {
	var ps;
	if (permission === 'read') ps = ['read', 'write', 'submit'];
	else if (permission === 'write') ps = ['write', 'submit'];
	else if (permission === 'submit') ps = ['submit'];
	return new Promise (function (resolve, reject) {
		getRoleObjectsCount ({
			role       : { $in: roles },
			stream     : null,
			project    : project,
			activity   : activity,
			permission : { $in: ps }
		})
		.then (function (n) {
			resolve ((n > 0));
		})
		.catch (reject);
	});
};
var canReadProject    = function (roles, project) {
	return canDoSomething (roles, project, null, 'read');
};
var canWriteProject   = function (roles, project) {
	return canDoSomething (roles, project, null, 'write');
};
var canSubmitProject  = function (roles, project) {
	return canDoSomething (roles, project, null, 'submit');
};
var canReadActivity   = function (roles, activity) {
	return canDoSomething (roles, {$ne:null}, activity, 'read');
};
var canWriteActivity  = function (roles, activity) {
	return canDoSomething (roles, {$ne:null}, activity, 'write');
};
var canSubmitActivity = function (roles, activity) {
	return canDoSomething (roles, {$ne:null}, activity, 'submit');
};
// -------------------------------------------------------------------------
//
// given a set of roles and an object, check if watching
//
// -------------------------------------------------------------------------
var isWatchingSomething = function (roles, project, activity) {
	return new Promise (function (resolve, reject) {
		getRoleObjectsCount ({
			role       : { $in: roles },
			stream     : null,
			project    : project,
			activity   : activity,
			watch      : true
		})
		.then (function (n) {
			resolve ((n > 0));
		})
		.catch (reject);
	});
};
var isWatchingProject = function (roles, project) {
	return isWatchingSomething (roles, project, null);
};
var isWatchingActivity = function (roles, activity) {
	return isWatchingSomething (roles, {$ne:null}, activity);
};
// -------------------------------------------------------------------------
//
// List of projects that this role set can view
//
// -------------------------------------------------------------------------
var getReadProjects = function (roles) {
	return new Promise (function (resolve, reject) {
		RoleObject.find ({
			roles : { $in: roles },
			project : { $ne : null },
			permission : { $in : ['read', 'write', 'submit']}
		})
		.populate ('project')
		.exec (function (err, models) {
			if (err) return reject (err);
			resolve (_.uniq (models, function (m) {return m.project._id;}));
		});
	});
};
