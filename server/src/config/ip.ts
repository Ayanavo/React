import https from "https";

export const getPublicIP = () =>
  new Promise((resolve, reject) => {
    https
      .get("https://react-lm2j.onrender.com", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data).ip));
      })
      .on("error", (err) => reject(err));
  });
