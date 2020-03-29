import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import { ClinicianApp } from "./ClinicianApp";
import firebase from "firebase";
import { firebaseInit } from "./FirebaseUtil";

function App() {
  async function initialize() {
    if (!firebase.apps.length) {
      await firebaseInit();
    }
  }
  initialize();

  return (
    <Router>
        <Switch>
          <Route path="/p/:encounterId">
            <PatientApp />
          </Route>
          <Route path="/c">
            <ClinicianApp />
          </Route>
        </Switch>
    </Router>
  );
};

export default App;
