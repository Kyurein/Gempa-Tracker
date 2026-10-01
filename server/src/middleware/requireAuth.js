import jwt from "jsonwebtoken";

// Expects "Authorization: Bearer <token>" and puts the user id on req.userId.
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Log in to use this feature" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Log in again." });
  }
}
