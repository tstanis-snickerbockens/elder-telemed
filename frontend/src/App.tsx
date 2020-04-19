import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import { ClinicianApp } from "./ClinicianApp";
import { StoryHome } from "./StoryHome";

function App() {
  return (
    <Router>
      <StoryHome>
        <Switch>
          <Route path="/p">
            <PatientApp />
          </Route>
          <Route path="/c">
            <ClinicianApp />
          </Route>
          <Redirect from="/" to="/p" />
        </Switch>
      </StoryHome>
    </Router>
  );
}

export default App;
