import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.split(" ")[1] : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
}
