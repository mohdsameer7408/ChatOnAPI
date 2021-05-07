import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET);
