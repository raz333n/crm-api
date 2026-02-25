const Activity = require("../models/activity-model");
const {
  createActivitySchema,
  updateActivitySchema,
} = require("../validators/activity-validator");

const activityController = {};

activityController.create = async (req, res) => {
  const { error, value } = createActivitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const activity = await Activity.create({
      ...value,
      assignedTo: req.userId,
      createdBy: req.userId,
    });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to create activity" });
  }
};

activityController.getOne = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      assignedTo: req.userId,
    }).lean();

    if (!activity)
      return res.status(404).json({ error: "Activity not found" });

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};

activityController.update = async (req, res) => {
  const { error, value } = updateActivitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.userId },
      value,
      { new: true }
    );

    if (!activity)
      return res.status(404).json({ error: "Activity not found" });

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to update activity" });
  }
};

activityController.delete = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      assignedTo: req.userId,
    });

    if (!activity)
      return res.status(404).json({ error: "Activity not found" });

    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete activity" });
  }
};

activityController.calendar = async (req, res) => {
  try {
    const { start, end, type } = req.query;

    const query = {
      assignedTo: req.userId,
    };

    if (start && end) {
      query.dueDate = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    if (type) {
      const types = type.split(",");
      query.type = { $in: types };
    }

    const activities = await Activity.find(query).lean();

    // Group by date
    const grouped = {};

    activities.forEach((activity) => {
      const dateKey = activity.dueDate.toISOString().split("T")[0];

      if (!grouped[dateKey]) grouped[dateKey] = [];

      const isOverdue =
        activity.status === "pending" &&
        new Date(activity.dueDate) < new Date();

      grouped[dateKey].push({
        ...activity,
        isOverdue,
      });
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
};

activityController.summary = async (req, res) => {
  try {
    const { month } = req.query; // format: 2026-03

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const activities = await Activity.aggregate([
      {
        $match: {
          assignedTo: new require("mongoose").Types.ObjectId(req.userId),
          dueDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$dueDate" },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    activities.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};