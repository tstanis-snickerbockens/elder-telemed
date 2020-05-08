import React, { MouseEvent } from "react";
import {
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "@material-ui/core/IconButton";
import { Encounter, newEncounter } from "./encounter";
import EncounterForm from "./EncounterForm";
import EncounterList from "./EncounterList";
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

interface EncounterPageProps {
  user: firebase.User | null;
  onVisit: (encounter: Encounter) => void;
}

interface EncounterPageState {
  anchorEl: HTMLElement | null;
  open: boolean;
  new_encounter_patient: string;
  new_encounter_advocate: string;
  new_encounter_date: string;
  refresh_encounter_list: boolean;
}

export default function EncounterPage({ user, onVisit }: EncounterPageProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const [open, setOpen] = React.useState(false);
  const [refreshEncounterList, setRefreshEncounterList] = React.useState(false);

  const handleNewEncounter = React.useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }, [setAnchorEl, setOpen]);

  const handleNewEncounterClose = React.useCallback((newSaved: boolean) => {
    setAnchorEl(null);
    setOpen(false);
    if (newSaved) {
      setRefreshEncounterList((old) => !old);
    }
  }, [setAnchorEl, setOpen, setRefreshEncounterList]);

  return (
    <>
      <div className={classes.mainContainer}>
        <IconButton aria-label="delete" onClick={handleNewEncounter}>
          <AddCircleIcon></AddCircleIcon>
        </IconButton>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleNewEncounterClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div className={classes.popoverInside}>
            <EncounterForm isNewEncounter={true} previousEncounter={newEncounter()} onComplete={handleNewEncounterClose}></EncounterForm>
          </div>
        </Popover>
        <EncounterList
          user={user}
          onVisit={onVisit}
          refresh={refreshEncounterList}
        ></EncounterList>
      </div>
    </>
  );
}
