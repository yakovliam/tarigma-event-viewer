import { useRecoilState, useSetRecoilState } from "recoil";
import Comtrade from "../../types/data/comtrade/comtrade";
import parseFileContentsToComtrade from "../parser/comtrade-parser";
import configlocal from "./config";
import datalocal from "./data";
import { eventsState } from "../recoil/atoms";
import useAsyncEffect from "use-async-effect";
import { useEffect } from "react";

const setComtrade = (setOpenComtrades: any, openComtrades: any, incrementedEventId:any) => {
  const config: any = configlocal;

  const data: any = datalocal;

  const comtradeOutput: Comtrade = parseFileContentsToComtrade(
    config,
    undefined,
    data,
    incrementedEventId
  );
  if (openComtrades.length != 0) {
    console.log("setting comtrade");
    setOpenComtrades((open: any) => [...open, comtradeOutput]);
  } else {
    console.log("setting first comtrade");
    setOpenComtrades([comtradeOutput]);
  }
};

export default () => {
  const [openComtrades, setOpenComtrades] = useRecoilState(eventsState);
  const incrementedEventId = openComtrades.length + 1;

  useAsyncEffect(async () => {
    setTimeout(setComtrade, 500, setOpenComtrades, openComtrades, incrementedEventId)
  }, []);
};
