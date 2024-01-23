import HelpIcon from "@mui/icons-material/Help";
import { Tooltip, useMediaQuery } from "@mui/material";
import ModalTemplete from "../Modal/ModalTemplete";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

const HelpQuestion = ({
  title = "",
  titleSize = "10px",
  content = "",
  iconSize = 18,
  iconColor = "secondary", //'inherit''action''disabled''primary''secondary''error''info''success''warning'
  otherCloseFun,
  maxWidth = "280px",
  ...props
}) => {
  const [show, setShow] = useState(false);

  const theme = useTheme();
  const padScreen = useMediaQuery(theme.breakpoints.down("768"));

  return (
    <>
      <Tooltip
        title={
          <>
            {!!title ? (
              <>
                <p className="text-lg ps-4 pt-2">{title}</p>
                <br />
              </>
            ) : null}

            {!!content ? <p className="text-lg p-4 pe-2">{content}</p> : null}
          </>
        }
        componentsProps={{
          tooltip: {
            sx: {
              padding: "0",
              margin: "0",
            },
          },
        }}
      >
        <HelpIcon
          className="!m-0 !p-0 cursor-pointer"
          sx={{ fontSize: iconSize }}
          color={iconColor}
          onClick={() => setShow(true)}
          {...props}
        />
      </Tooltip>
      <ModalTemplete
        title={"說明"}
        show={padScreen && show}
        onClose={() => {
          setShow(false);
        }}
        maxWidth={maxWidth}
      >
        <p className="mt-4">{content}</p>
      </ModalTemplete>
    </>
  );
};

export default HelpQuestion;
