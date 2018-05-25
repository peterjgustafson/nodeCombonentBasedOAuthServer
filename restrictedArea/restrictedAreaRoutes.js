module.exports =  (router, expressApp, restrictedAreaRoutesMethods) => {

    //route for entering into the restricted area.
    router.get('/enter',  expressApp.oauth.authorise(), restrictedAreaRoutesMethods.accessRestrictedArea)

    router.get('/validate', expressApp.oauth.authorise(), restrictedAreaRoutesMethods.validateToken)

    return router
}
