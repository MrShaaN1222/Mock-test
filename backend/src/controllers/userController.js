import mongoose from "mongoose";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { parseBooleanQuery, parsePagination, sanitizeText } from "../utils/request.js";

export async function listUsers(req, res, next) {
  try {
    const { role, isBlocked } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (role) filter.role = role;
    if (typeof isBlocked !== "undefined") filter.isBlocked = parseBooleanQuery(isBlocked);

    const [items, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid user id");
    }

    const { name, role } = req.body;
    const update = {};
    if (typeof name !== "undefined") update.name = sanitizeText(name, { maxLen: 100 });
    if (typeof role !== "undefined") update.role = role;

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

export async function blockUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid user id");
    }

    if (id === req.user.sub) {
      throw new ApiError(400, "You cannot block your own account");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      message: "User blocked successfully",
      user
    });
  } catch (error) {
    return next(error);
  }
}

export async function unblockUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      message: "User unblocked successfully",
      user
    });
  } catch (error) {
    return next(error);
  }
}
