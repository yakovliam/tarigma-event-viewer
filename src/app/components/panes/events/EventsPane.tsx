import { useState } from "react";

interface EventsPaneProps {
  viewId: string;
}

const EventsPane = () => {
  const [bool, setBool] = useState(false);

  return (
    <div>
      <h1>Events</h1>
      <button onClick={() => setBool(!bool)}>Toggle</button>
      {bool && <div>True</div>}
    </div>
  );
};

export default EventsPane;
