import HelpIcon from "@mui/icons-material/Help";
import { IconButton, Tooltip } from "@mui/material";

const HelpQuestion = ({
  title = "title",
  titleSize = "10px",
  content = "This is content",
  iconSize = 18,
  iconColor = "secondary",
  ...props
}) => {
  return (
    <Tooltip
      title={
        <>
          {!!title ? (
            <>
              <span className="text-lg">{title}</span>
              <br />
            </>
          ) : null}

          {!!content ? <span className="!p-2">{content}</span> : null}
        </>
      }
      componentsProps={{
        tooltip: {
          sx: {
            padding: "0",
          },
        },
      }}
    >
      <HelpIcon
        className="!m-0 !p-0 cursor-pointer"
        sx={{ fontSize: iconSize }}
        color={iconColor}
        {...props}
      />
    </Tooltip>
  );
};

export default HelpQuestion;
