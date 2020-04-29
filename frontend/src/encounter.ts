// Encounters are visits between doctors and patients.

export enum PersonState {
    NONE = 'none',
    PREPARING = 'preparing',
    READY = 'ready',
    ENCOUNTER = 'encounter',
};

enum EncounterState {
    SCHEDULED = 'scheduled',
    COMPLETE = 'complete'
}

export interface PersonTimedState {
    state: PersonState;
    lastUpdateTime: number;
}

export interface Encounter {
    encounterId: string;
    encounter: {
        patient: string;
        advocate: string;
        when: number;
        patientState: PersonTimedState;
        advocateState: PersonTimedState;
        doctorState: PersonTimedState;
        state: EncounterState;
    }
}

export function newEncounter(): Encounter {
    const encounterId = Math.floor(Math.random() * 1000000000).toString();
    return {
        encounterId: encounterId,
        encounter: {
            patient: "",
            advocate: "",
            when: new Date().getTime(),
            patientState: { state: PersonState.NONE, lastUpdateTime: 0 },
            advocateState: { state: PersonState.NONE, lastUpdateTime: 0 },
            doctorState: { state: PersonState.NONE, lastUpdateTime: 0 },
            state: EncounterState.SCHEDULED
        }
    }
}