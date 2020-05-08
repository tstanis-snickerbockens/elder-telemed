export interface Patient {
    patientEmail: string,
    patient: {
        name: string;
        phone?: string;
        advocate?: string;
    }
}