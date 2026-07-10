import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
  // Public routes that bypass auth verification
  const publicPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/health",
    "/metrics"
  ];

  if (publicPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  let token = null;

  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Check cookies if token not found in header
  if (!token && req.cookies) {
    token = req.cookies.accesstoken || req.cookies.refreshtoken;
  }

  if (!token) {
    return res.status(401).json({
      message: "Access Denied: No authentication token provided."
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      message: "Server configuration error: JWT_SECRET environment variable is missing."
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    // Inject user identity headers for downstream microservices
    if (decoded.id) {
      req.headers["x-user-id"] = decoded.id;
    }
    if (decoded.email) {
      req.headers["x-user-email"] = decoded.email;
    }

    return next();
  } catch (error) {
    // Seamless fallback: If header token expired, verify refreshtoken cookie
    if (req.cookies && req.cookies.refreshtoken) {
      try {
        const refreshDecoded = jwt.verify(req.cookies.refreshtoken, secret);
        req.user = refreshDecoded;
        if (refreshDecoded.id) {
          req.headers["x-user-id"] = refreshDecoded.id;
        }
        if (refreshDecoded.email) {
          req.headers["x-user-email"] = refreshDecoded.email;
        }
        return next();
      } catch (refreshErr) {
        // Fall through to 401
      }
    }

    return res.status(401).json({
      message: "Invalid or expired token.",
      error: error.message
    });
  }
};
