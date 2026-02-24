const Lead = require("../models/lead-model");
const { createLeadSchema } = require("../validators/lead-validator");

const leadController = {};

leadController.create = async (req, res) => {
  const { error, value } = createLeadSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((err) => err.message) });
  }

  try {
    const lead = await Lead.create({
      ...value,
      createdBy: req.userId,
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

leadController.list = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = leadController;