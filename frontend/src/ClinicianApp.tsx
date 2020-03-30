import React from "react";
import {
  RouteComponentProps,
  withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import firebase from "firebase";
import { ClinicianVideo } from "./ClinicianVideo";
import { WelcomePage } from "./WelcomePage";
import { EncounterPage } from "./EncounterPage";

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
});

type UserStatus = firebase.User | "signedout" | null;

interface ClinicianAppProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {

}

interface ClinicianAppState {
  user: firebase.User | null;
  encounterId: string | null;
}

class ClinicianAppImpl extends React.Component<ClinicianAppProps, ClinicianAppState>  {
  state: ClinicianAppState;
  constructor(props: ClinicianAppProps) {
    super(props);
    this.state = {user: null, encounterId: null};
    this.beginVisit = this.beginVisit.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    (async() => {
      const result = await firebase.auth().getRedirectResult();
      if (result.user) {
        // User just signed in. Can get result.credential and result.credential.accessToken
        console.log("Case 1 result.user");
        this.setState({user: result.user});
      } else if (firebase.auth().currentUser) {
        // User already signed in
        console.log("Case 2 result.user");
        this.setState({user: firebase.auth().currentUser});
      } else {
        this.setState({user: null});
      }
    })();
  }

  toggleSignIn() {
    console.log("toggleSignIn")
    if (!this.state.user) {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    } else {
        firebase.auth().signOut();
        this.setState({user: null});
    }
  }

  beginVisit(encounterId: string) {
    console.log("Begin encounter " + encounterId);
    this.setState(prevState => ({...prevState, encounterId: encounterId}));
  }

  onClose() {
    this.setState(prevState => ({...prevState, encounterId: null}));
  }

  render() {
    let page;
    if (this.state.user) {
      if (this.state.encounterId) {
        page = <ClinicianVideo user={this.state.user} encounterId={this.state.encounterId} onClose={this.onClose}></ClinicianVideo>;
      } else {
        page = <EncounterPage onVisit={this.beginVisit} user={this.state.user}></EncounterPage>;
      }
    } else {
      page = <WelcomePage></WelcomePage>;
    }
      return (
        <div className={this.props.classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={this.props.classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={this.props.classes.title}>
                Stealth Health - Clinician App
              </Typography>
              <Button onClick={() => {this.toggleSignIn()}} color="inherit">
              {!this.state.user?"Login":"Logout"}
            </Button>
          </Toolbar>
        </AppBar>
        {page}
      </div>
    );
  }
};

export const ClinicianApp = withStyles(styles)(withRouter(ClinicianAppImpl));