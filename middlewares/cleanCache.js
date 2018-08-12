const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    //we need to figure out a way to run the middleware 
    //after the request handler runs
    //await next lets the route handler complete its task
    //and then return back to the middleware
    await next()

    clearHash(req.user.id);
}