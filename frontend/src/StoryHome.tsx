import React, { useEffect, useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import * as firebase from "firebase/app";
import "firebase/auth";
import { WelcomePage } from "./WelcomePage";
import { yellow } from "@material-ui/core/colors";

const styles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    actionButton: {
      marginLeft: "auto",
      color: theme.palette.getContrastText(yellow[700]),
      backgroundColor: yellow[700],
      "&:hover": {
        backgroundColor: yellow[900],
      },
    },
    logo: {
      height: "47px",
    },
    topBar: {
      backgroundColor: "#2b5482",
    },
    bottomBar: {
      backgroundColor: "#2b5482",
      top: "auto",
      bottom: 0,
      height: "47px",
    },
  })
);

export type StoryHomeProps = {
  children: React.ReactNode;
};

const defaultContext = {
  user: (undefined as unknown) as firebase.User,
  setUserTopButton: (button: React.ReactNode | null) => {},
};
export const StoryContext = React.createContext(defaultContext);

type StoryTopButtonProps = {
  children: React.ReactNode;
  onClick: (e: unknown) => void;
};

export const StoryTopButton: React.FC<StoryTopButtonProps> = ({
  children,
  onClick,
}) => {
  const classes = styles();

  return (
    <Button
      variant="contained"
      color="inherit"
      className={classes.actionButton}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export function StoryHome({ children }: StoryHomeProps) {
  const classes = styles();
  // user has three possible settings: the user, null (signed out), undefined (dunno)
  // the page is rendered differently in each case
  const [user, setUser] = useState<firebase.User | null | undefined>(undefined);

  const [topButton, setTopButton] = useState<React.ReactNode | null>(null);
  const [userTopButton, setUserTopButton] = useState<React.ReactNode | null>(
    null
  );

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

  useEffect(() => {
    const toggleSignIn = () => {
      if (!user) {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
      } else {
        firebase.auth().signOut();
        setUser(null);
      }
    };

    setTopButton(
      userTopButton ||
        (user !== undefined && (
          <StoryTopButton onClick={() => toggleSignIn()}>
            {user ? "Logout" : "Login"}
          </StoryTopButton>
        )) ||
        null
    );
  }, [user, userTopButton, setTopButton, classes.actionButton]);

  const userContext: typeof defaultContext = user
    ? {
        user,
        setUserTopButton,
      }
    : defaultContext;
  return (
    <div className={classes.root}>
      <AppBar className={classes.topBar} position="static">
        <Toolbar>
          <img
            alt="Story Health"
            className={classes.logo}
            src="story_health.png"
          />
          {topButton}
        </Toolbar>
      </AppBar>
      {user ? (
        <StoryContext.Provider value={userContext}>
          {children}
        </StoryContext.Provider>
      ) : (
        <WelcomePage waiting={user === undefined}></WelcomePage>
      )}
      <AppBar
        position="fixed"
        color="primary"
        className={classes.bottomBar}
      ></AppBar>
    </div>
  );
};
StoryHome.whyDidYouRender = true
