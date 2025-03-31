module.exports = (roles) => (req, res, next) => {
  if (
    !req.user ||
    !req.user.role ||
    !roles
      .map((role) => role.toLowerCase())
      .includes(req.user.role.toLowerCase())
  ) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};
