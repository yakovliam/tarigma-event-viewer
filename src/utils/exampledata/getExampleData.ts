import { useRecoilState, useSetRecoilState } from "recoil";
import Comtrade from "../../types/data/comtrade/comtrade";
import parseFileContentsToComtrade from "../parser/comtrade-parser";
import configlocal from "./config";
import datalocal from "./data";
import { eventsState } from "../recoil/atoms";
import useAsyncEffect from "use-async-effect";
import { useEffect } from "react";
import { selectedSources as globalSelectedSources } from "../recoil/atoms";
import { defualtsource } from "./defsource"

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
    setOpenComtrades((open: any) => [...open, comtradeOutput]);
  } else {
    setOpenComtrades([comtradeOutput]);
  }
};

export default () => {
  const [openComtrades, setOpenComtrades] = useRecoilState(eventsState);
  const incrementedEventId = openComtrades.length + 1;
  const [selectedSources, setSelectedSources] = useRecoilState(globalSelectedSources);

  useAsyncEffect(async () => {
    setTimeout(setComtrade, 500, setOpenComtrades, openComtrades, incrementedEventId)
    
  }, []);
};
