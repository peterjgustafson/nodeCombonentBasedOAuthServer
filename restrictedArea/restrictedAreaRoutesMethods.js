module.exports =  {

  accessRestrictedArea: accessRestrictedArea,
  validateToken: validateToken
}

function accessRestrictedArea(req, res) {

    res.send('You have gained access to the area')
}

function validateToken(req, res) {
      //console.log("validateRequest: ", JSON.stringify(req));
      res.send({"token_validated": "true", "client_id": req.oauth.bearerToken.user.id, "businessId": req.oauth.bearerToken.user.businessId, "authorizedResource": req.oauth.bearerToken.authorizedResource});
  }
