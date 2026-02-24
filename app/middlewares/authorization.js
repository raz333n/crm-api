const authorization = (permittedRoles) => {
    return (req, res, next) => {
        if(permittedRoles.includes(req.role)){
            next();
        }
        res.status(403).json({error: 'Access Denied'})
    }
}

module.exports = authorization;