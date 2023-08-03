import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/features.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return next(new ErrorHandler("Please Enter All Fields", 404));
    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("Email Already Regisetered", 404));
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });
    sendToken(user, res, "registered Successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Please ENter All Fields", 404));
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Email is Not registered", 404));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler("Password dosent match", 404));
    sendToken(user, res, "Logged In Successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
};

export const logout = async (req, res, next) => {
  res
    .status(404)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
};
