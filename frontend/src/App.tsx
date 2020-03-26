import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import * as firebase from "firebase/app";
import { UserPage } from "./UserPage";
import { WelcomePage } from "./WelcomePage";

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

interface FirebaseProps {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  storageBucket: string;
  messagingSenderId: string;
}

type Props = {
  firebaseProps?: FirebaseProps;
};
const App: React.FC<Props> = ({ firebaseProps }) => {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    async function initialize() {
      if (firebaseProps) {
        firebase.initializeApp(firebaseProps);

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
      }
    }
    initialize();
  }, [firebaseProps]);

  const classes = useStyles();

  const toggleSignIn = () => {
    if (user) {
      if (firebaseProps) {
        firebase.auth().signOut();
      }
      setUser(null);
    } else {
      if (firebaseProps) {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
      } else {
        setUser({} as firebase.User);
      }
    }
  };

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
            Telemedicine for the Elderly
          </Typography>
          <Button onClick={toggleSignIn} color="inherit">
            {user ? "Logout" : "Login"}
          </Button>
        </Toolbar>
      </AppBar>
      {user ? <UserPage user={user}></UserPage> : <WelcomePage></WelcomePage>}
    </div>
  );
};

export default App;
