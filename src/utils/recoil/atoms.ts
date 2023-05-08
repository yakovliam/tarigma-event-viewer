import { atom } from "recoil";
import { initializeTiles } from "../mosaic/tiles-renderer";

const mosaicRepository = atom({
  key: "mosaicRepository",
  default: initializeTiles(),
});

export default mosaicRepository;
