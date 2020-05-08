import React, { ChangeEvent } from "react";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import { Encounter } from "./encounter";
import { PastEncounterList } from "./PastEncounterList";
import { RouteComponentProps, withRouter } from "react-router-dom";
import * as firebase from "firebase/app";

const styles = (theme: Theme) =>
  createStyles({
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
  });

interface PastEncounterPageProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {
  user: firebase.User | null;
  onVisit: (encounter: Encounter) => void;
}

interface PastEncounterPageState {
  anchorEl: HTMLElement | null;
  open: boolean;
  refresh_past_encounter_list: boolean;
}

class PastEncounterPageImpl extends React.Component<
  PastEncounterPageProps,
  PastEncounterPageState
> {
  constructor(props: PastEncounterPageProps) {
    super(props);
    this.state = {
      anchorEl: null,
      open: false,
      refresh_past_encounter_list: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const name = target.name;

    this.setState((prevState) => ({
      ...prevState,
      [name]: target.value,
    }));
  }

  render() {
    return (
      <>
        <div className={this.props.classes.mainContainer}>
          <PastEncounterList
            user={this.props.user}
            onVisit={this.props.onVisit}
            refresh={this.state.refresh_past_encounter_list}
            orderBy=""
            order=""
          ></PastEncounterList>
        </div>
      </>
    );
  }
}

export const PastEncounterPage = withStyles(styles)(withRouter(PastEncounterPageImpl));
