import Priority from "../models/Priority.js";

export const createPriority = async (req, res) => {
  try {
    const priority = await Priority.create(req.body);
    res.status(201).json(priority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriorities = async (_req, res) => {
  try {
    const priorities = await Priority.find();
    res.json(priorities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriorityById = async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) return res.status(404).json({ message: "Priority not found" });
    res.json(priority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePriority = async (req, res) => {
  try {
    const priority = await Priority.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!priority) return res.status(404).json({ message: "Priority not found" });
    res.json(priority);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePriority = async (req, res) => {
  try {
    const priority = await Priority.findByIdAndDelete(req.params.id);
    if (!priority) return res.status(404).json({ message: "Priority not found" });
    res.json({ message: "Priority deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
