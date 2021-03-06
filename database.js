const Realm = require('realm');
const _ = require('lodash');

const createRealm = (schema, schemaVersion, path) => {
  if (!schemaVersion) {
    schemaVersion = 0;
  }
  if (!path) {
    path = 'default.realm';
  }
  return new Realm({
    schema,
    schemaVersion,
    path
  })
}

const writeToRealm = (realm, writes) => {
  realm.write(() => {
    writes.forEach((write) => {
      executeWrite(realm, write.schema, write.object, write.action, write.filter, write.property);
    });
  });
}

const executeWrite = (realm, schema, object, action, filter, property) => {
  if (!action) {
    action = 'add';
  }
 
  if (action === 'add') {
    realm.create(schema, object);
  } else if (action === 'update') {
    realm.create(schema, object, true);
  } else if (action === 'updateMultiple') {
    let objectsToUpdate = realm.objects(schema).filtered(filter);
    
    _.forEach(objectsToUpdate, (objectToUpdate) => {
      if (!objectToUpdate) {
        console.log('Nope');
      }
      
      for (var key in object) {
        if (!objectToUpdate) {
          console.log('Nopee');
        }
        
        console.log(objectToUpdate[key] = 'NILL');
        
      }
    });
  } else if (action === 'deleteAll') {
    let objectToDelete = realm.objects(schema);
    realm.delete(objectToDelete);
  }else  if(action==='deleteid'){
    realm.delete(object);
  }
}

const fetchSchema = (realm) => {
  return realm.schema
}

const fetchSchemaVersion = (path) => {
  if (!path) {
    path = Realm.defaultPath;
  }
  return Realm.schemaVersion(path);
}

module.exports = {
  createRealm,
  writeToRealm,
  fetchSchema,
  fetchSchemaVersion,
}