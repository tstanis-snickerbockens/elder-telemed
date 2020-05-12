import React, { useEffect, useState, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import UserPage from "./UserPage";
import PatientHomePage from "./PatientHomePage";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";
import { StoryContext, StoryTopButton } from "./StoryHome";
import { Encounter } from "./encounter";

interface PatientAppProps extends RouteComponentProps<{}> {}

const PatientAppImpl: React.FC<PatientAppProps> = () => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [mode, setMode] = useState(PatientMode.HOME);
  const [clinicianReady] = useState(false);
  const { user, setUserTopButton } = useContext(StoryContext);

  const startAppointment = (encounter: Encounter, role: Role) => {
    setEncounter(encounter);
    setRole(role);
    setMode(PatientMode.WAITING_ROOM);
  };

  useEffect(() => {
    if (mode === PatientMode.HOME) {
      setUserTopButton(null);
    } else if (mode === PatientMode.IN_ENCOUNTER) {
      setUserTopButton(
        <StoryTopButton onClick={() => setMode(PatientMode.WAITING_ROOM)}>
          End Appointment
        </StoryTopButton>
      );
    } else {
      setUserTopButton(
        <StoryTopButton onClick={() => setMode(PatientMode.IN_ENCOUNTER)}>
          Start Appointment
        </StoryTopButton>
      );
    }
  }, [mode, user, setUserTopButton]);

  if (encounter) {
    return (
      <UserPage
        encounter={encounter}
        role={role}
        mode={mode}
        clinicianReady={clinicianReady}
      ></UserPage>
    );
  } else {
    return (
      <PatientHomePage
        onStartAppointment={startAppointment}
        user={user}
      ></PatientHomePage>
    );
  }
};

export const PatientApp = withRouter(PatientAppImpl);
