import React, { useState, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import "firebase/auth";

import { ClinicianVideo } from "./ClinicianVideo";
import { EncounterPage } from "./EncounterPage";
import {PastEncounterPage} from "./PastEncounterPage";
import { PatientPage } from "./PatientPage";
import { Box, Tabs, Tab } from "@material-ui/core";
import { StoryContext, StoryTopButton } from "./StoryHome";
import { Encounter } from "./encounter";

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
  onVisit: (e: Encounter) => void;
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
        <Tab label="Patients" />
        <Tab label="Previous Visits" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <EncounterPage onVisit={onVisit} user={user}></EncounterPage>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PatientPage user={user}></PatientPage>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <PastEncounterPage onVisit={onVisit} user={user}></PastEncounterPage>
      </TabPanel>
    </div>
  );
};
const ClinicianAppImpl: React.FC<ClinicianAppProps> = () => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const { user, setUserTopButton } = useContext(StoryContext);

  const endVisit = () => {
    setEncounter(null);
    setUserTopButton(null);
  };

  const beginVisit = (encounter: Encounter) => {
    console.log("Begin encounter " + encounter.encounterId);
    setEncounter(encounter);
    setUserTopButton(
      <StoryTopButton onClick={endVisit}>End Appointment</StoryTopButton>
    );
  };

  return encounter ? (
    <ClinicianVideo
      user={user}
      encounter={encounter}
      onClose={endVisit}
    ></ClinicianVideo>
  ) : (
    <MainClinicianPanel onVisit={beginVisit} user={user}></MainClinicianPanel>
  );
};

export const ClinicianApp = withStyles(styles)(withRouter(ClinicianAppImpl));
