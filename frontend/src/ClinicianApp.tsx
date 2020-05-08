import React from "react";

import * as firebase from "firebase/app";
import "firebase/auth";

<<<<<<< HEAD
import ClinicianVideo from "./ClinicianVideo";
import EncounterPage from "./EncounterPage";
=======
import { ClinicianVideo } from "./ClinicianVideo";
import { EncounterPage } from "./EncounterPage";
import {PastEncounterPage} from "./PastEncounterPage";
>>>>>>> b668dd3... WIP checkin. Add new past encounter page on ClinicianApp, needs to query past encounters and fetch transcript files and display them
import { PatientPage } from "./PatientPage";
import { Box, Tabs, Tab } from "@material-ui/core";
import { StoryContext } from "./StoryHome";
import { Encounter } from "./encounter";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel( { children, value, index, ...other }: TabPanelProps) {

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

  const handleChange = React.useCallback((_: any, newValue: number) => {
    setValue(newValue);
  }, [setValue]);

  console.log("MainClinicianPanel");
  return (
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
      >
        <Tab label="Encounters" />
        <Tab label="Patients" />
        <Tab label="Previous Encounters" />
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
export default function ClinicianApp() {

  const [encounter, setEncounter] = React.useState<Encounter | null>(null);
  const { user } = React.useContext(StoryContext);

  const endVisit = React.useCallback(() => {
    setEncounter(null);
  }, [setEncounter]);

  const beginVisit = React.useCallback((encounter: Encounter) => {
    console.log("Begin encounter " + encounter.encounterId);
    setEncounter(encounter);
  }, [setEncounter]);
  console.log("ClinicianApp");
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
