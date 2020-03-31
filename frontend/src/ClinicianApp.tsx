import React from "react";
import clsx from 'clsx';
import {
  RouteComponentProps,
  withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Drawer from '@material-ui/core/Drawer';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ScheduleIcon from '@material-ui/icons/Schedule';
import PeopleIcon from '@material-ui/icons/People';
import firebase from "firebase";
import { ClinicianVideo } from "./ClinicianVideo";
import { WelcomePage } from "./WelcomePage";
import { EncounterPage } from "./EncounterPage";
import { PatientPage } from "./PatientPage";

const drawerWidth = 240;
const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
});

interface ClinicianAppProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {

}

enum Panel {
  ENCOUNTERS = 1,
  PATIENTS = 2
}

interface ClinicianAppState {
  user: firebase.User | null;
  encounterId: string | null;
  drawerOpen: boolean;
  activePanel: Panel;
}

class ClinicianAppImpl extends React.Component<ClinicianAppProps, ClinicianAppState>  {
  constructor(props: ClinicianAppProps) {
    super(props);
    this.state = {user: null, encounterId: null, drawerOpen: true, activePanel:Panel.ENCOUNTERS};
    this.beginVisit = this.beginVisit.bind(this);
    this.onClose = this.onClose.bind(this);

    this.handleListItemClick = this.handleListItemClick.bind(this);
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

  handleDrawerClose() {

  }

  handleListItemClick(newActivePanel: Panel) {
    this.setState(prevState => ({...prevState, activePanel: newActivePanel}));
  };

  render() {
    let page;
    if (this.state.user) {
      if (this.state.encounterId) {
        page = <ClinicianVideo user={this.state.user} encounterId={this.state.encounterId} onClose={this.onClose}></ClinicianVideo>;
      } else {
        if (this.state.activePanel === Panel.ENCOUNTERS) {
          page = <EncounterPage onVisit={this.beginVisit} user={this.state.user}></EncounterPage>;
        } else{
          page = <PatientPage user={this.state.user}></PatientPage>;
        }
      }
    } else {
      page = <WelcomePage></WelcomePage>;
    }
      return (
        <div className={this.props.classes.root}>
          <AppBar position="fixed"
            className={clsx(this.props.classes.appBar, {
              [this.props.classes.appBarShift]: this.state.drawerOpen,
            })}>
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
          <Drawer
            className={this.props.classes.drawer}
            variant="persistent"
            anchor='left'
            open={this.state.drawerOpen}
            classes={{
              paper: this.props.classes.drawerPaper,
            }}
          >
            <div className={this.props.classes.drawerHeader}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List component="nav">
              <ListItem button key="Encounters" selected={this.state.activePanel === Panel.ENCOUNTERS}
                onClick={() => {this.handleListItemClick(Panel.ENCOUNTERS)}}>
                <ListItemIcon><ScheduleIcon /></ListItemIcon>
                <ListItemText primary="Encounters" />
              </ListItem>
              <ListItem button key="Patients" selected={this.state.activePanel === Panel.PATIENTS}
                onClick={() => {this.handleListItemClick(Panel.PATIENTS)}}>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Patients" />
              </ListItem>
            </List>
          </Drawer>
          <main
            className={clsx(this.props.classes.content, {
              [this.props.classes.contentShift]: this.state.drawerOpen,
            })}
          >
            <div className={this.props.classes.drawerHeader} />
            {page}
          </main>
        </div>
    );
  }
};

export const ClinicianApp = withStyles(styles)(withRouter(ClinicianAppImpl));