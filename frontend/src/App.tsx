import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import { ClinicianApp } from "./ClinicianApp";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/p">
          <PatientApp />
        </Route>
        <Route path="/c">
          <ClinicianApp />
        </Route>
        <Redirect from="/" to="/p" />
      </Switch>
    </Router>
  );
}

export default App;
