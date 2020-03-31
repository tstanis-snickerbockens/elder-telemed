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
import { UserPage } from "./UserPage";
import { WelcomePage } from "./WelcomePage";
import { PatientHomePage } from "./PatientHomePage";
import { PatientWaitingRoom } from "./PatientWaitingRoom";

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

interface PatientAppProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  
}

enum Page {
  HOME = 1,
  WAITING_ROOM = 2,
  VISIT = 3
}
interface PatientAppState {
  user: firebase.User | null;
  encounterId: string | null;
  page: Page;
}
class PatientAppImpl extends React.Component<PatientAppProps, PatientAppState>  {
  constructor(props: PatientAppProps) {
    super(props);
    this.state = {user: null, encounterId: null, page: Page.HOME};
    this.beginVisit = this.beginVisit.bind(this);
    this.onStartAppointment = this.onStartAppointment.bind(this);
  }

  beginVisit() {

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
    if (this.state.user) {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    } else {
      firebase.auth().signOut();
    }
  };

  onStartAppointment(encounterId: string) {
    this.setState(prevState => ({...prevState, encounterId: encounterId, page: Page.WAITING_ROOM}));
  }

  render() {
    let page;
    if (this.state.user) {
      if (this.state.page === Page.HOME) {
        page = <PatientHomePage onStartAppointment={this.onStartAppointment} user={this.state.user}></PatientHomePage>
      } else if (this.state.page === Page.WAITING_ROOM) {
        page = <PatientWaitingRoom user={this.state.user}></PatientWaitingRoom>
      } else {
        page = <UserPage user={this.state.user}></UserPage>
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
              Stealth Health - Patient App
            </Typography>
            <Button onClick={this.toggleSignIn} color="inherit">
              {!this.state.user?"Login":"Logout"}
            </Button>
          </Toolbar>
        </AppBar>
        {page}
      </div>
    );
  }
};

export const PatientApp = withStyles(styles)(withRouter(PatientAppImpl));