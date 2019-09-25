const mysql = require('promise-mysql');

const connectionConfig = {
  host: process.env.host,
  user: process.env.username,
  password: process.env.password,
  port: process.env.port,
  database: process.env.database
};

const createTable = function (event, callbackFunc) {
  var connection;
  var query = 
`create table document (
userId varchar(50), 
fileName varchar(50), 
providerName varchar(100), 
total varchar(20), 
location varchar(20), 
status varchar(20),
primary key (userId, fileName)
)`;
mysql.createConnection(connectionConfig)
.then(conn => {
  connection = conn;
  var result = connection.query(query); //matching-matched-edited
  connection.end();
  return result;
})
.then(result => {
  //Ejecutamos la búsqueda de patrones

  return callbackFunc(null, result);
})
.catch(err => {
  console.log('Error en createTable');
  return callbackFunc(err, null);
});

}

const insertObj = function (event, callbackFunc) {
  var connection;
  var query = 
`insert into document (userId, fileName, providerName, total, location, status)
values (?, ?, ?, ?, ?)`;
  mysql.createConnection(connectionConfig)
  .then(conn => {
    connection = conn;
    var result = connection.query(query, 
      [event.userId,
      event.fileName,
      event.providerName,
      event.total,
      'input',
      'matching']); //matching-matched-edited
    connection.end();
    return result;
  })
  .then(result => {
    //Ejecutamos la búsqueda de patrones

    return callbackFunc(null, result);
  })
  .catch(err => {
    console.log('Error en insertObj');
    return callbackFunc(err, null);
  });

}

const reprocObj = function (event, callbackFunc) {
  var connection;
  var query = 
`update status = ? 
where userId = ? and fileName = ? and location = 'input'`;
  mysql.createConnection(connectionConfig)
  .then(conn => {
    connection = conn;
    var result = connection.query(query, ['matching']); //matching-matched-edited
    connection.end();
    return result;
  })
  .then(result => {
    return callbackFunc(null, result);
  })
  .catch(err => {
    console.log('Error en updateObj');
    return callbackFunc(err, null);
  });
}

const updateObj= function (event, callbackFunc) {
  console.log('function updateObj');
  var connection;
  var query = 
`update document set providerName = ?, total = ?, status = ? 
where userId = ? and fileName = ? and location = 'input'`;
  mysql.createConnection(connectionConfig)
  .then(conn => {
    connection = conn;
    var result = connection.query(query, 
      [event.providerName,
      event.total,
      'edited', //matching-matched-edited
      event.userId,
      event.fileName]);
    connection.end();
    return result;
  })
  .then(result => {
    return callbackFunc(null, result);
  })
  .catch(err => {
    console.log('Error en updateObj');
    return callbackFunc(err, null);
  });
}

const listObj = function (event, callbackFunc) {
  console.log('function listObj');
  var connection;
  var query = `select * from document where userId = ? and location = 'input'`;
  mysql.createConnection(connectionConfig)
    .then(conn => {
      connection = conn;
      var result = connection.query(query, [event.userId]);
			connection.end();
      return result;
    })
    .then(result => {
      return callbackFunc(null, result);
    })
    .catch(err => {
      console.log('Error en listObj');
      return callbackFunc(err, null);
    });
}

const deleteObj = function (event, callbackFunc) {
  callbackFunc(null, null);
}

const createResponse = function(statusCode, body) {
  return {
    "statusCode": statusCode,
    "headers": { "content-type": "application/json" },
    "body": JSON.stringify(body),
    "isBase64Encoded": false
    };
}

module.exports.handler = (event, context, callback) => {
  //console.log('event ::: ' + JSON.stringify(event));
  //console.log('context ::: ' + JSON.stringify(context));
  let body = JSON.parse(event.body);
  body.userId = event.requestContext.identity.cognitoIdentityId;
  console.log('body ::: ' + JSON.stringify(body));
  
  //context.callbackWaitsForEmptyEventLoop = false;
  try {

    const callbackFunc = function (err, result) {
      if (err) {
        console.log('err ::: ' + JSON.stringify(err));        
        callback(null, createResponse(555, err.message));
        return;
      } else {
        console.log('result ::: ' + JSON.stringify(result));
        callback(null, createResponse(200, result));
        return;
      }
    }

    //console.log('event.body ::: ' + JSON.stringify(event.body));
    //console.log('event.body.opt ::: ' + JSON.stringify(event.body.opt));
    
    
    switch (body.opt) {
      case "insert": insertObj(body, callbackFunc); break;
      case "reproc": reprocObj(body, callbackFunc); break;
      case "update": updateObj(body, callbackFunc); break;
      case "list": listObj(body, callbackFunc); break;
      case "delete": deleteObj(body, callbackFunc); break;
      case "createTable": createTable(body, callbackFunc); break;
    }
    
    return;
    
  } catch (err) {
    console.log('err ::: ' + JSON.stringify(err));
    callback(null, createResponse(555, err.message));
    context.succeed();
  }
}
