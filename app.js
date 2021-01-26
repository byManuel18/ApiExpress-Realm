const Realm = require('realm');
const express = require('express');
const bodyParser = require('body-parser');
const rlib = require('./database');

const app = express();


const defaultRealmSchema = [
  {
    name: 'Cliente',
    primaryKey: 'id',
    properties: {
      id: 'int',
      name: 'string',
    }
  }
];


const metaRealmSchema = [{
  name: 'meta',
  primaryKey: 'schemaVersion',
  properties: {
    schemaVersion: 'int',
    schema: 'string',
    path: 'string',
  }
}];

// Starting the meta realm
let metaRealm = rlib.createRealm(metaRealmSchema, 0, 'meta.realm');

// Populates the meta realm for the first time
if (metaRealm.objects('meta').length < 1) {
  rlib.writeToRealm(metaRealm, [{
    action: 'add',
    schema: 'meta',
    object: {
      schemaVersion: 0,
      schema: JSON.stringify(defaultRealmSchema),
      path: 'default.realm',
    }
  }]);
}

let metaData = metaRealm.objects('meta').filtered('path = "default.realm"').sorted('schemaVersion', true); // grabbing all metaData for our default realm (realm.default) sorted by latest (descending) schemaVersion
let realm = rlib.createRealm(JSON.parse(metaData["0"].schema), metaData["0"].schemaVersion); // Create default realm from latest (["0"]) metaData

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', 'http://localhost:3000');
  res.setHeader('access-control-allow-credentials', true);
  next();
});

app.get('/get/:schema/all', (req, res) => {
  res.send({
    results: realm.objects(req.params.schema)
  });
});

app.get('/get/:schema/:id', (req, res) => {
  res.send({
    results: { "0": realm.objectForPrimaryKey(req.params.schema, Number(req.params.id)) }
  });
});

app.get('/get/:schema/length', (req, res) => {
  res.send({
    length: realm.objects(req.params.schema).length,
  });
});
app.post('/add/:schema', (req, res, next) => {
  console.info('Adding the following to ', req.params.schema, ' schema:\n', req.body);
  next()
}, (req, res) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, object: req.body }]);
  console.info(req.params.schema, ' has been added successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "add",
    success: true,
  });
});
app.put('/update/:schema', (req, res, next) => {
  console.info('Updating the following to ', req.params.schema, ' schema:\n', req.body);
  next()
}, (req, res) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, object: req.body, action: 'update' }]);
  console.info(req.params.schema, ' has been updated successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "update",
    success: true,
  });
});

app.delete('/delete/:schema/:id',(req,res)=>{
  res.send({
    results: { "0": realm.objectForPrimaryKey(req.params.schema, Number(req.params.id)) }
  });
  let e= realm.objectForPrimaryKey(req.params.schema, Number(req.params.id));
  rlib.writeToRealm(realm,[{ schema: req.params.schema, action: 'deleteid',object:e}]);
})

app.delete('/delete/:schema/all', (req, res, next) => {
  console.info('Deleting all ', req.params.schema);
  next()
}, (req, res) => {
  rlib.writeToRealm(realm, [{ schema: req.params.schema, action: 'deleteAll' }]);
  console.info('All objects of schema type ', req.params.schema, ' have been deleted successfully!\n');
  res.send({
    schema: req.params.schema,
    action: "deleteAll",
    success: true,
  });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).send({
    success: false,
    error: err.message,
  });
});

app.listen(3001, () => {
  console.log('http://localhost:3001');
});