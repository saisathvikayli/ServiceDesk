import User from "../models/User.js";

// @desc    Get users list (optionally filtered by role)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .populate("departmentId", "name code")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("departmentId", "name code");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
