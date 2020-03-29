import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import { ClinicianApp } from "./ClinicianApp";

function App() {
  return (
    <Router>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/p/:encounterId">
            <PatientApp />
          </Route>
          <Route path="/c/:encounterId">
            <ClinicianApp />
          </Route>
        </Switch>
    </Router>
  );
};

export default App;
