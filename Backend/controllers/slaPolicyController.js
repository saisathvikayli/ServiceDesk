import SLAPolicy from "../models/SLAPolicy.js";

export const createSlaPolicy = async (req, res) => {
  try {
    const slaPolicy = await SLAPolicy.create(req.body);
    res.status(201).json(slaPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSlaPolicies = async (_req, res) => {
  try {
    const slaPolicies = await SLAPolicy.find();
    res.json(slaPolicies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSlaPolicyById = async (req, res) => {
  try {
    const slaPolicy = await SLAPolicy.findById(req.params.id);
    if (!slaPolicy) return res.status(404).json({ message: "SLA policy not found" });
    res.json(slaPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSlaPolicy = async (req, res) => {
  try {
    const slaPolicy = await SLAPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slaPolicy) return res.status(404).json({ message: "SLA policy not found" });
    res.json(slaPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSlaPolicy = async (req, res) => {
  try {
    const slaPolicy = await SLAPolicy.findByIdAndDelete(req.params.id);
    if (!slaPolicy) return res.status(404).json({ message: "SLA policy not found" });
    res.json({ message: "SLA policy deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
