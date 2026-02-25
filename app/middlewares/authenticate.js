const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({error : "Access Denied. No token provided"});
    }

    try{
        const parsedToken = token.replace("Bearer ", "")
        const decoded = jwt.verify(parsedToken, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch(err){
        return res.status(401).json({error : err.message})
    }
}

module.exports = authenticate