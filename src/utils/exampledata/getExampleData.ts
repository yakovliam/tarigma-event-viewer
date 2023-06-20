import { useRecoilState, useSetRecoilState } from "recoil";
import Comtrade from "../../types/data/comtrade/comtrade";
import parseFileContentsToComtrade from "../parser/comtrade-parser";
import configlocal from "./config";
import datalocal from "./data";
import { eventsState } from "../recoil/atoms";
import useAsyncEffect from "use-async-effect";

export default () => {
  const [openComtrades, setOpenComtrades] = useRecoilState(eventsState);
  const incrementedEventId = openComtrades.length + 1;

  useAsyncEffect(async () => {
    if(openComtrades.length == 0){
    const config: any = configlocal;

    const data: any = datalocal;

    const comtradeOutput: Comtrade = parseFileContentsToComtrade(
      config,
      undefined,
      data,
      incrementedEventId
    );

    setOpenComtrades((open) => [...open, comtradeOutput]);
    }
  }, []);
};
