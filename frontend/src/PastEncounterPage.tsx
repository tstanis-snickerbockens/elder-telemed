import React from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import { Encounter } from "./encounter";
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
  user: firebase.User | null;
  onVisit: (encounter: Encounter) => void;
}

export default function PastEncounterPage({ user, onVisit }: PastEncounterPageProps) {
  const classes = useStyles();
  
  return (
    <>
      <div className={classes.mainContainer}>
        <PastEncounterList
          user={user}
          onVisit={onVisit}
          refresh={true}
        ></PastEncounterList>
      </div>
    </>
  );
}
