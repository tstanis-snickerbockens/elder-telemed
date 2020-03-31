import React, {MouseEvent, ChangeEvent} from 'react';
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { PatientList } from "./PatientList";
import {
    RouteComponentProps,
    withRouter
  } from "react-router-dom";
import firebase from "firebase";

const styles = (theme: Theme) => createStyles({
    typography: {
        padding: theme.spacing(2),
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
});

interface PatientPageProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
    user: firebase.User | null;
}

interface PatientPageState {
    anchorEl: HTMLElement | null 
    open: boolean
    new_patient_email: string
    refresh_patient_list: boolean
}

class PatientPageImpl extends React.Component<PatientPageProps, PatientPageState> {
    constructor(props: PatientPageProps) {
        super(props);
        this.state = {anchorEl: null, open: false, new_patient_email: '', refresh_patient_list: false}
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleNewPatient(event: MouseEvent<HTMLButtonElement>) {
        this.setState({anchorEl: event.currentTarget, open:true});
    }

    handleNewPatientClose() {
    }

    handleSavePatient() {
        var createPatient = firebase.functions().httpsCallable('createPatient');
        var page = this;
        createPatient({'patientEmail': this.state.new_patient_email, 'patient': {'email':this.state.new_patient_email }})
            .then(function(response) {
                console.log("Create Encounter Response: " + console.log(JSON.stringify(response.data)));
                page.setState(prevState => ({...prevState, refresh_patient_list: !prevState.refresh_patient_list}));
            })
            .catch(err => {console.log(err)});
        this.setState({anchorEl: null, open:false});
    }

    handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const name = target.name;
    
        this.setState(prevState => ({
            ...prevState,
            [name]: target.value,
          }));
    }

    render() {
        return (
            <>
            <Button variant="contained" color="primary" onClick={(event: MouseEvent<HTMLButtonElement>)=>(this.handleNewPatient(event))}>
                <Typography className={this.props.classes.typography}>New Patient</Typography>
            </Button>
            <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                onClose={this.handleNewPatientClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}>
                <form className={this.props.classes.container} noValidate>
                    <div>
                        <TextField name="new_patient_email" onChange={this.handleInputChange} id="patient-email" label="Email" />
                    </div>
                    <div>
                    </div>
                </form>
                <Button variant="contained" onClick={()=>(this.handleSavePatient())}>Save</Button>
            </Popover>
            <PatientList user={this.props.user} refresh={this.state.refresh_patient_list} orderBy="" order=""></PatientList>
            </>
        );
    }
}


export const PatientPage = withStyles(styles)(withRouter(PatientPageImpl));