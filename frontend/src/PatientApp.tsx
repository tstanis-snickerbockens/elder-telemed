import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  createStyles,
  Theme,
  makeStyles
} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import * as firebase from "firebase/app";
import "firebase/auth";
import UserPage from "./UserPage";
import { WelcomePage } from "./WelcomePage";
import { PatientHomePage } from "./PatientHomePage";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";
import { yellow } from '@material-ui/core/colors';

const styles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    actionButton: {
      marginLeft: 'auto',
      color: theme.palette.getContrastText(yellow[700]),
      backgroundColor: yellow[700],
        '&:hover': {
          backgroundColor: yellow[900],
        },
    },
    logo: {
      height: '47px',
    },
    topBar: {
      backgroundColor: "#2b5482"
    },
    bottomBar: {
      backgroundColor: "#2b5482",
      top: "auto",
      bottom: 0,
      height: "47px",
    },
    hidden: {
      display: 'none'
    },
  }));

interface PatientAppProps
  extends RouteComponentProps<{}>{}


const PatientAppImpl: React.FC<PatientAppProps> = () => {
  const classes = styles();
  const [user, setUser] = useState<firebase.User | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [mode, setMode] = useState(PatientMode.HOME);
  const [clinicianReady] = useState(false);
  const [pageComponent, setPageComponent] = useState(<WelcomePage></WelcomePage>);
  const [topButton, setTopButton] = useState();

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

  
  const startAppointment = (encounterId: string, role: Role) => {
    setEncounterId(encounterId);
    setRole(role);
    setMode(PatientMode.WAITING_ROOM);
  };

  useEffect(() => {
    if (user) {
      if (mode === PatientMode.HOME) {
        setPageComponent(
          <PatientHomePage
            onStartAppointment={startAppointment}
            user={user}
          ></PatientHomePage>
        );
      } else if (encounterId) {
        setPageComponent(
          <UserPage encounterId={encounterId} role={role} mode={mode} clinicianReady={clinicianReady}></UserPage>
        );
      }
    }
  }, [user, encounterId, mode, clinicianReady, role]);
  
  useEffect(() => {
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

    if (mode === PatientMode.HOME) {
      setTopButton(<Button
            variant="contained"
            color="inherit"
            id="loginState"
            className={classes.actionButton}
            onClick={() => toggleSignIn()}
          >
            {!user ? "Login" : "Logout"}
          </Button>);
    } else if (mode === PatientMode.IN_ENCOUNTER) {
      setTopButton(
        <Button className={classes.actionButton} variant="contained" onClick={() => setMode(PatientMode.WAITING_ROOM)} color="primary">
          End Appointment
        </Button>);
    } else {
      setTopButton(
        <Button className={classes.actionButton} variant="contained" onClick={() => setMode(PatientMode.IN_ENCOUNTER)} color="primary">
          Start Appointment
        </Button>);
    }
  }, [mode, user, classes.actionButton]);

  return (
    <div className={classes.root}>
      <AppBar className={classes.topBar} position="static">
        <Toolbar>
          <img alt='Story Health' className={classes.logo} src='story_health.png'/>
          {topButton}
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

export const PatientApp = withRouter(PatientAppImpl);
