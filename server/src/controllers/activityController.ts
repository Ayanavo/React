import { Request, Response } from "express";
import Activity from "../models/activityModel.js";
import Tag from "../models/tagModel.js";

type ActivityBody = {
  title?: string;
  name?: string;
  description?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  priority?: string;
  location?: string;
  tag?: string;
  recurrence?: {
    enabled?: boolean;
    interval?: "day" | "month" | "year";
    endDate?: string;
  };
};

type RecurrenceInterval = "day" | "month" | "year";

const MAX_RECURRENCE_OCCURRENCES = 366;

function parseActivityInput(body: ActivityBody) {
  const title = (body.title ?? body.name)?.trim();

  return {
    title,
    description: body.description?.trim() ?? "",
    start: body.start ? new Date(body.start) : undefined,
    end: body.end ? new Date(body.end) : undefined,
    allDay: Boolean(body.allDay),
    color: body.color ?? "#6366f1",
    priority: body.priority ?? "medium",
    location: body.location?.trim() ?? "",
    tag: body.tag?.trim() || undefined,
    recurrence: body.recurrence,
  };
}

async function resolveTagId(tagId: string | undefined, userId?: string) {
  if (!tagId) return undefined;

  const query = userId ? { _id: tagId, createdBy: userId } : { _id: tagId };
  const tag = await Tag.findOne(query);
  if (!tag) {
    throw new Error("INVALID_TAG");
  }

  return tag._id;
}

function addInterval(date: Date, interval: RecurrenceInterval) {
  const next = new Date(date);

  if (interval === "day") {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (interval === "month") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  next.setFullYear(next.getFullYear() + 1);
  return next;
}

function generateRecurrenceOccurrences(
  start: Date,
  end: Date | undefined,
  recurrenceEnd: Date,
  interval: RecurrenceInterval
) {
  const occurrences: Array<{ start: Date; end?: Date }> = [];
  const durationMs = end ? end.getTime() - start.getTime() : 60 * 60 * 1000;

  let currentStart = new Date(start);

  while (currentStart <= recurrenceEnd && occurrences.length < MAX_RECURRENCE_OCCURRENCES) {
    const occurrenceStart = new Date(currentStart);
    const occurrenceEnd = end ? new Date(occurrenceStart.getTime() + durationMs) : undefined;
    occurrences.push({ start: occurrenceStart, end: occurrenceEnd });

    const nextStart = addInterval(currentStart, interval);
    if (nextStart.getTime() <= currentStart.getTime()) {
      break;
    }

    currentStart = nextStart;
  }

  return occurrences;
}

function buildActivityDocument(
  parsed: ReturnType<typeof parseActivityInput>,
  occurrence: { start: Date; end?: Date },
  tagId: unknown,
  userId?: string
) {
  return {
    name: parsed.title,
    description: parsed.description,
    start: occurrence.start,
    end: occurrence.end,
    allDay: parsed.allDay,
    color: parsed.color,
    status: "todo",
    priority: parsed.priority,
    location: parsed.location,
    tag: tagId,
    createdBy: userId,
  };
}

export const getActivities = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const activities = await Activity.find(query).sort({ start: -1 });
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error });
  }
};

export const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const activity = await Activity.findOne(query);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ activity });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity", error });
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const parsed = parseActivityInput(req.body);

    if (!parsed.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!parsed.start || Number.isNaN(parsed.start.getTime())) {
      return res.status(400).json({ message: "A valid start date is required" });
    }

    let tagId;
    try {
      tagId = await resolveTagId(parsed.tag, req.user?.id);
    } catch {
      return res.status(400).json({ message: "Invalid tag selected" });
    }

    const recurrence = parsed.recurrence;
    const isRecurring = Boolean(recurrence?.enabled);

    if (isRecurring) {
      const interval = recurrence?.interval;
      const recurrenceEnd = recurrence?.endDate ? new Date(recurrence.endDate) : undefined;

      if (!interval || !["day", "month", "year"].includes(interval)) {
        return res.status(400).json({ message: "A valid recurrence interval is required" });
      }

      if (!recurrenceEnd || Number.isNaN(recurrenceEnd.getTime())) {
        return res.status(400).json({ message: "A valid recurrence end date is required" });
      }

      if (recurrenceEnd < parsed.start) {
        return res.status(400).json({ message: "Recurrence end date must be after the start date" });
      }

      const occurrences = generateRecurrenceOccurrences(parsed.start, parsed.end, recurrenceEnd, interval);

      if (!occurrences.length) {
        return res.status(400).json({ message: "No recurring events could be generated for the selected range" });
      }

      const documents = occurrences.map((occurrence) =>
        buildActivityDocument(parsed, occurrence, tagId, req.user?.id)
      );

      const activities = await Activity.insertMany(documents);

      return res.status(201).json({
        message: `${activities.length} recurring ${activities.length === 1 ? "activity" : "activities"} created successfully`,
        activity: activities[0],
        activities,
      });
    }

    const activity = await Activity.create(buildActivityDocument(parsed, { start: parsed.start, end: parsed.end }, tagId, req.user?.id));

    res.status(201).json({ message: "Activity created successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Error creating activity", error });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = parseActivityInput(req.body);
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };

    if (!parsed.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!parsed.start || Number.isNaN(parsed.start.getTime())) {
      return res.status(400).json({ message: "A valid start date is required" });
    }

    let tagId;
    try {
      tagId = await resolveTagId(parsed.tag, req.user?.id);
    } catch {
      return res.status(400).json({ message: "Invalid tag selected" });
    }

    const updatedActivity = await Activity.findOneAndUpdate(
      query,
      {
        name: parsed.title,
        description: parsed.description,
        start: parsed.start,
        end: parsed.end,
        allDay: parsed.allDay,
        color: parsed.color,
        priority: parsed.priority,
        location: parsed.location,
        tag: tagId ?? null,
      },
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "Activity updated successfully", activity: updatedActivity });
  } catch (error) {
    res.status(500).json({ message: "Error updating activity", error });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const deletedActivity = await Activity.findOneAndDelete(query);

    if (!deletedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting activity", error });
  }
};
