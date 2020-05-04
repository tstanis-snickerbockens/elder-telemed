// Encounters are visits between doctors and patients.

export enum PersonState {
    NONE = 'none',
    PREPARING = 'preparing',
    READY = 'ready',
    ENCOUNTER = 'encounter',
};

export enum EncounterState {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETE = 'complete',
    DELETED = 'deleted'
}

export enum EncounterUpdate {
    FULL = "full",
    GENERAL_STATE = "general_state",
    PATIENT_STATE = "patient_state",
    ADVOCATE_STATE = "advocate_state",
    DOCTOR_STATE = "doctor_state",
}

export interface PersonTimedState {
    state: PersonState;
    lastUpdateTime: number;
    // First time when the person went from state NONE -> PREPARING.  Used for showing
    // how long they have been waiting.
    arrivalTime: number;
    // Time of last state transition.
    stateTransitionTime: number;
}

export enum ClinicianImpression {
    UNCONFIRMED,
    CONFIRMED,
    DELETED
}

export interface EncounterAudioAnnotation {
    category: string;
    type: string;
    text: string;
    score: number;
    clinicianImpression: ClinicianImpression;
}

export interface Encounter {
    encounterId: string;
    encounter: {
        patient: string;
        advocate: string;
        when: number;
        // Title of the encounter.  Displayed to clinician and patient to
        // indicate the purpose of the encounter.
        title?: string;
        // Scheduled duration of the encounter in minutes.
        scheduledDuration? : number;
        patientState: PersonTimedState | null;
        advocateState: PersonTimedState | null;
        doctorState: PersonTimedState | null;
        state: EncounterState | null;
        audioAnnotations?: Array<EncounterAudioAnnotation>;
    }
    updateType?: EncounterUpdate;
}

export function newEncounter(): Encounter {
    const encounterId = Math.floor(Math.random() * 1000000000).toString();
    return {
        encounterId: encounterId,
        encounter: {
            patient: "",
            advocate: "",
            when: new Date().getTime(),
            patientState: newPersonTimedState(),
            advocateState: newPersonTimedState(),
            doctorState: newPersonTimedState(),
            state: EncounterState.SCHEDULED
        }
    }
}

export function newPersonTimedState(): PersonTimedState {
    return { state: PersonState.NONE, lastUpdateTime: 0, arrivalTime: 0, stateTransitionTime: 0 };
}