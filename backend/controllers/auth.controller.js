import Admin from "../models/Admin.model.js";
import { comparePassword } from "../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  // verifyAccessToken,
} from "../utils/jwt.js";

/**
 * ADMIN LOGIN
 */

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    const admin = await Admin.findOne({ email }).select(
      "+password +refreshToken"
    );
    if (!admin) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken({
      id: admin._id,
      role: admin.role,
    });

    const refreshToken = generateRefreshToken({
      id: admin._id,
    });

    admin.refreshToken = refreshToken;
    await admin.save();

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REFRESH ACCESS TOKEN
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const admin = await Admin.findById(decoded.id).select("+refreshToken");
    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({
      id: admin._id,
      role: admin.role,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Refresh token expired or invalid" });
  }
};
