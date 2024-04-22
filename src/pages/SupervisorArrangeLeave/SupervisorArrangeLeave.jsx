import React from "react";
import ArrangeLeave from "../../components/ArrangeLeave/ArrangeLeave";

const SupervisorArrangeLeave = () => {
  return (
    <>
      <ArrangeLeave forSuperVisor={true} title={""} url={"supervisor/arrangedLeave"} />
    </>
  );
};

export default SupervisorArrangeLeave;

