import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import firebase from "firebase";
import { UserPage } from "./UserPage";
import { WelcomePage } from "./WelcomePage";
import { firebaseInit } from "./FirebaseUtil";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

type UserStatus = firebase.User | "signedout" | null;

export const ClinicianApp: React.FC<{}> = () => {
  const [userStatus, setUserStatus] = useState<UserStatus>(null);

  useEffect(() => {
    async function initialize() {
      await firebaseInit();

      const result = await firebase.auth().getRedirectResult();
      if (result.user) {
        // User just signed in. Can get result.credential and result.credential.accessToken
        console.log("Case 1 result.user");
        setUserStatus(result.user);
      } else if (firebase.auth().currentUser) {
        // User already signed in
        console.log("Case 2 result.user");
        setUserStatus(firebase.auth().currentUser);
      } else {
        setUserStatus("signedout");
      }
    }
    initialize();
  }, []);

  const classes = useStyles();

  const toggleSignIn = () => {
    if (userStatus) {
      if (userStatus === "signedout") {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
      } else {
        firebase.auth().signOut();

        setUserStatus("signedout");
      }
    }
  };

  function onUserStatus<T>(
    onSignedIn: (u: firebase.User) => T,
    onSignedOut: () => T,
    onWaiting: () => T
  ): T {
    if (userStatus === "signedout") {
      return onSignedOut();
    }
    if (userStatus) {
      return onSignedIn(userStatus);
    }
    return onWaiting();
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Stealth Health
          </Typography>
          <Button onClick={toggleSignIn} color="inherit">
            {onUserStatus(
              () => "Logout",
              () => "Login",
              () => ""
            )}
          </Button>
        </Toolbar>
      </AppBar>
      {onUserStatus(
        user => (
          <UserPage user={user}></UserPage>
        ),
        () => (
          <WelcomePage></WelcomePage>
        ),
        () => (
          <></>
        )
      )}
    </div>
  );
};
