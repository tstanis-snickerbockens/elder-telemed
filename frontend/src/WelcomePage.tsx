import React from "react";
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  splashScreen: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
}));

export const WelcomePage: React.FC<{ waiting?: boolean }> = ({ waiting }) => {
  const classes = useStyles();

  return (
    <div className={classes.splashScreen}>
      <Typography variant="h4">Welcome to</Typography>
      <Typography variant="h2">
        Stealth Health : Telemedicine for the Elderly
      </Typography>
      <Typography>{waiting ? "" : "Please log in."}</Typography>
    </div>
  );
};
