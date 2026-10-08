// CORRECT
import slaPolicy from '../models/slapolicy.js'
// @desc    Get all SLA policies
// @route   GET /api/sla-policies
// @access  Private (Manager, Admin)
export const getSlaPolicies = async (req, res) => {
  try {
    const policies = await SlaPolicy.find().sort({ priorityId: 1 });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch SLA policies", error: error.message });
  }
};

// @desc    Create SLA policy
// @route   POST /api/sla-policies
// @access  Private (Manager, Admin)
export const createSlaPolicy = async (req, res) => {
  try {
    const policy = await SlaPolicy.create(req.body);
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ message: "Failed to create SLA policy", error: error.message });
  }
};

// @desc    Update SLA policy
// @route   PUT /api/sla-policies/:id
// @access  Private (Manager, Admin)
export const updateSlaPolicy = async (req, res) => {
  try {
    const policy = await SlaPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(policy);
  } catch (error) {
    res.status(400).json({ message: "Failed to update SLA policy", error: error.message });
  }
};

// @desc    Delete SLA policy
// @route   DELETE /api/sla-policies/:id
// @access  Private (Admin)
export const deleteSlaPolicy = async (req, res) => {
  try {
    await SlaPolicy.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "SLA policy deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete SLA policy", error: error.message });
  }
};