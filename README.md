# Elder Telemed

Telemedicine Demo for Elderly Patients

## Background

The elderly have historically been underserved by telemedicine applications, which initially focus on convenient care -- targeting busy, bustling digital natives looking for a quick answer from a clinician or 'script for a treatment to get them back to their busy lives faster. These telemedicine apps are not designed for the unique UX needs of the elderly, their caregivers, and their clinicians.

With coronavirus driving many of us into our homes and restricted with air travel, caretakers for the elderly are now in a vulnerable position trying to understand, support, and even coordinate their care. Going into the hospital for care is riskier than ever before, so a telemedicine app that they can actually use might be of great use.

## Goal

Produce a working demo of a telemedicine app aimed at the elderly and their caregivers.

## Coordination

- [Slack](https://join.slack.com/t/snickerbockens/shared_invite/zt-cua073nq-RiXmgxqbWuXAFXcED47uWg)
- Zoom
- [Google Docs](https://docs.google.com/document/d/1J8fRQK_VLuflq340FZ_hyTNnvMxWi_nKyj1Xv7EVaos/edit)


## Production Demo Instructions

- Go to the production clinician interface and setup a patient and encounter
  - https://elder-telemed.firebaseapp.com/c
  - Login with a Google account (Login is top right).
  - Go to "Patients"
  - Click "New Patient"
  - Enter your email address.
  - Go to "Encounters"
  - "New Encounter"
  - Use the same email address for the patient (TODO: make this a picker)
- Start a patient session in a new tab AFTER you have setup the patient and encounter in the clinician interface.
  - https://elder-telemed.firebaseapp.com/p
  - Click "Start Appointment"
  - Click "Start Appointment"
  - Go back to your clinician tab and click "Go" next to the encounter you started.
- You should now have a patient and a clinician tab that are connected (it may take a few 10s of seconds) (this can be flaky, try refreshing the patient experience again if it isn't connecting)
## Run Locally

- Request to be added as collaborator to elder-telemed firebase project (contact Tom Stanis)
- git pull
- Install firebase CLI
- Run firebase login
- Goto https://console.firebase.google.com/u/0/project/elder-telemed/settings/serviceaccounts/adminsdk and generate a private key.  Download it.
- export GOOGLE_APPLICATION_CREDENTIALS="/Users/yourusername/Downloads/service-account-file.json"
- Run firebase emulators:start
- cd frontend
- npm start
- Goto localhost:3000/p or localhost:3000/c
