import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { PatientApp } from "./PatientApp";
import ClinicianApp from "./ClinicianApp";
import { StoryHome } from "./StoryHome";
import { Role } from "./Role";

function App() {
  console.log("Root App");
  return (
    <Router>
      <StoryHome>
        <Switch>
          <Route exact path="/p">
            <PatientApp inputRole={null}/>
          </Route>
          <Route path="/p/e/:encounterId">
            <PatientApp inputRole={Role.PATIENT}/>
          </Route>
          <Route path="/a/e/:encounterId">
            <PatientApp inputRole={Role.ADVOCATE}/>
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
