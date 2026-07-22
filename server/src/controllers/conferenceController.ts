import { Request, Response } from "express";
import moment from "moment";
import {
  createConferenceLink,
  isConferenceProviderConfigured,
  type ConferenceProvider,
} from "../services/conferenceService.js";

type ConferenceLinkBody = {
  provider?: ConferenceProvider;
  title?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  previousMeetingId?: string;
};

export const createConferenceLinkHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body as ConferenceLinkBody;
    const provider = body.provider;

    if (provider !== "zoom" && provider !== "google_meet") {
      return res.status(400).json({ message: "A valid conference provider is required" });
    }

    if (!isConferenceProviderConfigured(provider)) {
      const envHint =
        provider === "zoom"
          ? "Configure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET."
          : "Configure GOOGLE_CALENDAR_REFRESH_TOKEN with calendar.events scope.";
      return res.status(503).json({ message: `${provider === "zoom" ? "Zoom" : "Google Meet"} is not configured. ${envHint}` });
    }

    const title = body.title?.trim();
    if (!title) {
      return res.status(400).json({ message: "Title is required to schedule a conference" });
    }

    if (!body.start || !moment(body.start).isValid()) {
      return res.status(400).json({ message: "A valid start date is required" });
    }

    const result = await createConferenceLink({
      provider,
      title,
      start: body.start,
      end: body.end,
      allDay: Boolean(body.allDay),
      description: body.description,
      previousMeetingId: body.previousMeetingId,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create conference link";
    res.status(500).json({ message });
  }
};
