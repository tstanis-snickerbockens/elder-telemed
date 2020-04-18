import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import { ClinicianApp } from "./ClinicianApp";
import { StealthHome } from "./StealthHome";

function App() {
  return (
    <Router>
      <StealthHome>
        <Switch>
          <Route path="/p">
            <PatientApp />
          </Route>
          <Route path="/c">
            <ClinicianApp />
          </Route>
          <Redirect from="/" to="/p" />
        </Switch>
      </StealthHome>
    </Router>
  );
}

export default App;
