import React, { useEffect, useState, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import UserPage from "./UserPage";
import { PatientHomePage } from "./PatientHomePage";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";
import { StealthContext, StealthTopButton } from "./StealthHome";

interface PatientAppProps extends RouteComponentProps<{}> {}

const PatientAppImpl: React.FC<PatientAppProps> = () => {
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [mode, setMode] = useState(PatientMode.HOME);
  const [clinicianReady] = useState(false);
  const { user, setUserTopButton } = useContext(StealthContext);

  const startAppointment = (encounterId: string, role: Role) => {
    setEncounterId(encounterId);
    setRole(role);
    setMode(PatientMode.WAITING_ROOM);
  };

  useEffect(() => {
    if (mode === PatientMode.HOME) {
      setUserTopButton(null);
    } else if (mode === PatientMode.IN_ENCOUNTER) {
      setUserTopButton(
        <StealthTopButton onClick={() => setMode(PatientMode.WAITING_ROOM)}>
          End Appointment
        </StealthTopButton>
      );
    } else {
      setUserTopButton(
        <StealthTopButton onClick={() => setMode(PatientMode.IN_ENCOUNTER)}>
          Start Appointment
        </StealthTopButton>
      );
    }
  }, [mode, user, setUserTopButton]);

  if (encounterId) {
    return (
      <UserPage
        encounterId={encounterId}
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
