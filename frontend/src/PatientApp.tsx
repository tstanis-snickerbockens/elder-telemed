import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import * as firebase from "firebase/app";
import "firebase/auth";
import { UserPage } from "./UserPage";
import { WelcomePage } from "./WelcomePage";
import { PatientHomePage } from "./PatientHomePage";
import { PatientWaitingRoom } from "./PatientWaitingRoom";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      fontFmily: "Roboto",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "18px",
      letterSpacing: "0.03em",
      fontVariant: "small-caps",
    },
    actionButton: {
      backgroundColor: "#FCD446",
    },
    bottomBar: {
      top: "auto",
      bottom: 0,
      height: "47px",
    },
  });

interface PatientAppProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {}

enum Page {
  HOME = 1,
  WAITING_ROOM = 2,
  IN_ENCOUNTER = 3,
}
const PatientAppImpl: React.FC<PatientAppProps> = ({ classes }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [page, setPage] = useState(Page.HOME);

  useEffect(() => {
    (async () => {
      const result = await firebase.auth().getRedirectResult();
      if (result.user) {
        // User just signed in. Can get result.credential and result.credential.accessToken
        console.log("Case 1 result.user");
        setUser(result.user);
      } else if (firebase.auth().currentUser) {
        // User already signed in
        console.log("Case 2 result.user");
        setUser(firebase.auth().currentUser);
      } else {
        setUser(null);
      }
    })();
  }, []);

  const toggleSignIn = () => {
    if (!user) {
      console.log("sign in");
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    } else {
      firebase.auth().signOut();
      setUser(null);
    }
  };
  const startAppointment = (encounterId: string) => {
    setEncounterId(encounterId);
    setPage(Page.WAITING_ROOM);
  };

  const enterEncounter = () => {
    setPage(Page.IN_ENCOUNTER);
  };

  let pageComponent = <WelcomePage></WelcomePage>;
  if (user) {
    if (page === Page.HOME) {
      pageComponent = (
        <PatientHomePage
          onStartAppointment={startAppointment}
          user={user}
        ></PatientHomePage>
      );
    } else if (page === Page.WAITING_ROOM && encounterId) {
      pageComponent = (
        <PatientWaitingRoom
          onEnterEncounter={enterEncounter}
          user={user}
          encounterId={encounterId}
        ></PatientWaitingRoom>
      );
    } else if (encounterId) {
      pageComponent = (
        <UserPage user={user} encounterId={encounterId}></UserPage>
      );
    }
  }
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Stealth Health
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            id="loginState"
            className={classes.actionButton}
            onClick={() => toggleSignIn()}
          >
            {!user ? "Login" : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>
      {pageComponent}
      <AppBar
        position="fixed"
        color="primary"
        className={classes.bottomBar}
      ></AppBar>
    </div>
  );
};

export const PatientApp = withStyles(styles)(withRouter(PatientAppImpl));
