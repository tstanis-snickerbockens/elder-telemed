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

import { ClinicianVideo } from "./ClinicianVideo";
import { WelcomePage } from "./WelcomePage";
import { EncounterPage } from "./EncounterPage";
import { PatientPage } from "./PatientPage";
import { Box, Tabs, Tab } from "@material-ui/core";

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

interface ClinicianAppProps
  extends RouteComponentProps<{}>,
    WithStyles<typeof styles> {}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

type MainClinicianPanelProps = {
  onVisit: (s: string) => void;
  user: firebase.User;
};

const MainClinicianPanel = ({ onVisit, user }: MainClinicianPanelProps) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        <Tab label="Encounters" />
        <Tab label="Patient" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <EncounterPage onVisit={onVisit} user={user}></EncounterPage>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PatientPage user={user}></PatientPage>
      </TabPanel>
    </div>
  );
};
const ClinicianAppImpl: React.FC<ClinicianAppProps> = ({ classes }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);

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

  const beginVisit = (eid: string) => {
    console.log("Begin encounter " + eid);
    setEncounterId(eid);
  };

  const onClose = () => {
    setEncounterId(null);
  };

  let pageComponent;
  if (user) {
    if (encounterId) {
      pageComponent = (
        <ClinicianVideo
          user={user}
          encounterId={encounterId}
          onClose={onClose}
        ></ClinicianVideo>
      );
    } else {
      pageComponent = (
        <MainClinicianPanel
          onVisit={beginVisit}
          user={user}
        ></MainClinicianPanel>
      );
    }
  } else {
    pageComponent = <WelcomePage></WelcomePage>;
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

export const ClinicianApp = withStyles(styles)(withRouter(ClinicianAppImpl));
