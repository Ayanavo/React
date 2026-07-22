import fs from "fs";

const spec = JSON.parse(fs.readFileSync("c:/Users/Administrator/Downloads/Calendar.json", "utf8"));

function findEventType(obj, path = "", out = []) {
  if (!obj || typeof obj !== "object") return out;
  for (const [key, value] of Object.entries(obj)) {
    const next = path ? `${path}.${key}` : key;
    if (key === "eventType" || (typeof value === "string" && /zoom meeting|addon type|phone|offline/i.test(value))) {
      out.push({ path: next, sample: typeof value === "string" ? value : JSON.stringify(value).slice(0, 500) });
    }
    findEventType(value, next, out);
  }
  return out;
}

const hits = findEventType(spec).filter((h) => h.path.includes("events"));
console.log("event-related hits", hits.length);
for (const hit of hits.slice(0, 40)) {
  console.log("\n", hit.path);
  console.log(hit.sample);
}
