import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import PastEncounterList from "./PastEncounterList";
import * as firebase from "firebase/app";

const useStyles = makeStyles((theme: Theme) => createStyles({
  typography: {
    padding: theme.spacing(2),
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  mainContainer: {
    padding: theme.spacing(3),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  popoverInside: {
    margin: theme.spacing(1),
  },
}));

interface PastEncounterPageProps {
  user: firebase.User;
}

export default function PastEncounterPage({ user }: PastEncounterPageProps) {
  const classes = useStyles();
  
  return (
    <>
      <div className={classes.mainContainer}>
        <PastEncounterList
          user={user}
          refresh={true}
        ></PastEncounterList>
      </div>
    </>
  );
}
