import express from "express";
import path from "path";
import { updateListings, getVolumesByPlaceId } from "./controller/listings";
import { getGeoms } from "./controller/geoPlace";

process.on("unhandledRejection", (e) => {
  throw e;
});

const app = express();
app.use(express.static(path.join(__dirname, "../static")));

app.get("/update_data", updateListings);
app.get("/api/geoms", getGeoms);
app.get("/api/get_price/:cog", getVolumesByPlaceId);

const port = 5000;
app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});
