const Lead = require("../models/lead-model");
const { createLeadSchema, updateLeadSchema } = require("../validators/lead-validator");

const leadController = {};

leadController.create = async (req, res) => {
  const { error, value } = createLeadSchema.validate(req.body, {abortEarly: false});

  if (error) {
    return res.status(400).json({ error: error.details.map((err) => err.message) });
  }

  try {
    const lead = await Lead.create({...value, createdBy: req.userId});
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.list = async (req, res) => {
  try {
    const leads = await Lead.find().populate("assignedTo", "name email").populate("createdBy", "name email");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.update = async (req, res) => {
  const { error, value } = updateLeadSchema.validate(req.body, {abortEarly: false});

  if (error) {
    return res.status(400).json({ error: error.details.map((err) => err.message) });
  }

  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Basic ownership logic
    if (req.userRole === "sales" && lead.assignedTo?.toString() !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, value, { new: true });
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.remove = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Only admin OR creator can delete
    if (req.userRole !== "admin" && lead.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.updateStage = async (req, res) => {
  const { stage } = req.body;

  const allowedStages = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost"
  ];

  if (!allowedStages.includes(stage)) {
    return res.status(400).json({ error: "Invalid stage" });
  }

  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Restrict sales to their leads
    if (
      req.userRole === "sales" &&
      lead.assignedTo?.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    lead.stage = stage;
    await lead.save();

    res.json({ message: "Stage updated", lead });

  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.pipelineView = async (req, res) => {
  try {
    const query = {};

    // Restrict sales to their leads
    if (req.userRole === "sales") {
      query.assignedTo = req.userId;
    }

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const stages = [
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "won",
      "lost"
    ];

    const grouped = {};

    // Initialize empty arrays
    stages.forEach(stage => {
      grouped[stage] = [];
    });

    // Group leads
    leads.forEach(lead => {
      grouped[lead.stage].push(lead);
    });

    res.json(grouped);

  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = leadController;