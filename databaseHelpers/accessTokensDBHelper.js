let mySqlConnection


//get the mySql object
const mySql = require('mysql')

module.exports = injectedMySqlConnection => {

  mySqlConnection = injectedMySqlConnection

  return {
   saveAccessToken: saveAccessToken,
   getUserIDFromBearerToken: getUserIDFromBearerToken
 }
}

function saveAccessToken(accessToken, userID, callback) {

  var d = new Date();
  var seconds = Math.round(d.getTime() / 1000);

  const getUserQuery =  `INSERT INTO access_tokens (access_token, user_id, access_token_timestamp, expires) VALUES ("${accessToken}", "${userID}", ${seconds}, ${600}) ON DUPLICATE KEY UPDATE access_token = "${accessToken}", access_token_timestamp = ${seconds};`

console.log("saveAccessToken: ", getUserQuery);
  //execute the query to get the user
  mySqlConnection.query(getUserQuery, (dataResponseObject) => {


      //pass in the error which may be null and pass the results object which we get the user from if it is not null
      callback(dataResponseObject.error)
  })
}


function getUserIDFromBearerToken(bearerToken, callback, component = null){

  var d = new Date();
  var seconds = Math.round(d.getTime() / 1000);
  console.log("seconds: ", seconds);
  //create query to get the userID from the row which has the bearerToken
  //var getUserIDQuery = `SELECT access_tokens.*, users.username, companies.company_id FROM access_tokens, users, companies WHERE access_tokens.user_id = users.user_id AND users.company_id = companies.company_id AND access_token = '${bearerToken}' AND access_token_timestamp + 3600 > ${seconds};`
  //var getUserIDQuery = `SELECT * FROM gatekeeper.getAccessTokenUserID WHERE access_token = '${bearerToken}'`
  var getUserIDQuery =`CALL gatekeeper.checkToken('${bearerToken}', '${component}')`;
    
  
  console.log("getUserIDFromBearerToken: ", getUserIDQuery);
  //execute the query to get the userID
  mySqlConnection.query(getUserIDQuery, (dataResponseObject) => {
      console.log(dataResponseObject);
      console.log(typeof(dataResponseObject.results[0]));

      if(typeof(dataResponseObject.results[0]) == "undefined") {
        callback(null, null)
        return;
      }
    
      //get the userID from the results if its available else assign null
      const userID = dataResponseObject.results != null && dataResponseObject.results.length > 0 ?
      
      dataResponseObject.results[0][0].user_id : null

      
      console.log("TOKEN RESPONSE");
      console.log(dataResponseObject.results[0][0]);

      const companyId = dataResponseObject.results != null && dataResponseObject.results.length > 0 ?
      
      dataResponseObject.results[0][0].company_id : null

      callback(userID, companyId)

    // getUserIDQuery = mySql.format(`UPDATE access_tokens SET access_token_timestamp = '?' WHERE access_token = ?;`, [seconds, bearerToken]);
    // //getUserIDQuery = `SELECT * FROM access_tokens;`
    // console.log("keepAlive: ", getUserIDQuery);
      
    //   mySqlConnection.query(getUserIDQuery, (dataResponseObject) => {
    
    //       console.log("updated", dataResponseObject);
    //   });
  })
}
