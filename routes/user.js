import { Router } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { generateToken } from "../config/generateToken.js";
import verifyToken from "../config/verifyToken.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const userName = email.split("@", 1)[0];

  // some validations...
  const doesUserExists = await User.findOne({ email });
  if (doesUserExists)
    return res
      .status(400)
      .send("A user with this email already exists try Signing In!");

  const hashedPassword = await generateHashedPassword(password);

  const user = new User({
    userName,
    email,
    password: hashedPassword,
  });

  try {
    const createdUser = await user.save();
    res.status(201).json({
      _id: createdUser._id,
      userName: createdUser.userName,
      email: createdUser.email,
      token: generateToken(createdUser),
    });
  } catch (error) {
    res.status(500).send("Something went wrong and an error occoured: ", error);
  }
});

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const doesUserExists = await User.findOne({ email });

    // validations
    if (!doesUserExists) return res.status(400).send("Invalid Email!");

    const isPasswordValid = await bcrypt.compare(
      password,
      doesUserExists.password
    );
    if (!isPasswordValid) return res.status(400).send("Invalid Password!");

    const token = generateToken(doesUserExists);
    res.status(200).header("auth-token", token).json({
      _id: doesUserExists._id,
      userName: doesUserExists.userName,
      email: doesUserExists.email,
      token,
    });
  } catch (error) {
    res.status(500).send("Something went wrong and an error occoured: ", error);
  }
});

router.patch("/user/profile/update", verifyToken, async (req, res) => {
  const { _id } = req.user;
  const { userName, password } = req.body;
  let data = { userName };
  if (password) {
    const hashedPassword = await generateHashedPassword(password);
    data = { ...data, password: hashedPassword };
  }

  try {
    const user = await User.findOneAndUpdate({ _id }, data, {
      new: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      _id: user._id,
      email: user.email,
      userName: user.userName,
    });
  } catch (error) {
    res.status(500).send("Something went wrong and an error occured: ", error);
  }
});

// generating a hash password
const generateHashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.log("Hashing error: ", error);
  }
};

export default router;
