import { useDropzone } from "react-dropzone";
import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import Comtrade from "../../types/data/comtrade/comtrade";
import parseFileContentsToComtrade from "../../utils/parser/comtrade-parser";
import { eventsState as eventsStateAtom } from "../../utils/recoil/atoms";

const getFileExtension = (filename: string): string =>
  filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
  filename;

const useFileUpload = (acceptNewComtrade: (comtrade: Comtrade) => void) => {
  const { open, acceptedFiles } = useDropzone();
  const [isLoading, setIsLoading] = useState(false);

  const eventsState = useRecoilValue(eventsStateAtom);
  const incrementedEventId = eventsState.length + 1;

  function readFileAsync(file: File): Promise<string> {
    return new Promise((resolve: (content: string) => void, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsText(file);
    });
  }

  const uploadAndParseComtradeFiles = async () => {
    // if includes required file types
    const configFile: File | undefined = acceptedFiles.find(
      (f) => getFileExtension(f.name) === "cfg"
    );

    const dataFile: File | undefined = acceptedFiles.find(
      (f) => getFileExtension(f.name) === "dat"
    );

    const headerFile: File | undefined = acceptedFiles.find(
      (f) => getFileExtension(f.name) === "hdr"
    );

    if (!configFile || !dataFile) {
      // todo fancy modal saying that you're missing data
      return;
    }

    /* get config, data, and header file data */
    let configContents: string | null = null;
    let headerContents: string | null = null;
    let dataContents: string | null = null;

    // config
    configContents = await readFileAsync(configFile);

    // data
    dataContents = await readFileAsync(dataFile);

    // optional header
    if (headerFile) {
      headerContents = await readFileAsync(headerFile);
    }

    if (
      !configContents ||
      !dataContents ||
      eventsState.some((c) => c.eventId === incrementedEventId)
    ) {
      return;
    }

    const comtradeOutput: Comtrade = parseFileContentsToComtrade(
      configContents,
      headerContents || undefined,
      dataContents,
      incrementedEventId
    );

    // call accept new comtade function
    acceptNewComtrade(comtradeOutput);

    // clear accepted files to prevent duplicate events in a debug session
    acceptedFiles.splice(0, acceptedFiles.length);
  };

  useEffect(() => {
    if (!acceptedFiles || acceptedFiles.length <= 0) {
      return;
    }

    // set 'add events' button to loading
    setIsLoading(true);
    uploadAndParseComtradeFiles().then(() => {
      // set 'add events' button to not loading anymore
      setIsLoading(false);
    });
  }, [acceptedFiles]);

  return { openFileDialog: open, isLoading };
};

export default useFileUpload;
