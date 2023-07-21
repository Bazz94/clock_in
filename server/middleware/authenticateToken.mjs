import jwt from 'jsonwebtoken';

function authToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json("No token found");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, auth) => {
    if (err) {
      return res.status(401).json({ message: "Token not valid", err: err });
    }
    req.auth = auth;
    next();
  })
}

export default authToken;