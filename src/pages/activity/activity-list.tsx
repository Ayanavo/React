import React from "react";
import moment from "moment";

function activitylist({ events }: { events: Array<{ title: string; start: string; end: string }> }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Events:</h2>
      <ul className="space-y-2">
        {events.map((activity, i) => (
          <li key={i} className="flex justify-between items-center text-sm">
            <span className="truncate">{activity.title}</span>
            <div>
              <span className="text-gray-500">{moment(activity.start).format("DD MM YYYY")}</span>
              <span className="text-gray-500">-</span>
              <span className="text-gray-500">{moment(activity.end).format("DD MM YYYY")}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default activitylist;
