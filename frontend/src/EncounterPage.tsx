import React, {MouseEvent, ChangeEvent} from 'react';
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { EncounterList } from "./EncounterList";
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
    mainContainer: {
        padding: theme.spacing(3),
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
});

interface EncounterPageProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
    user: firebase.User | null;
    onVisit: (encounterId: string) => void
}

interface EncounterPageState {
    anchorEl: HTMLElement | null 
    open: boolean
    new_encounter_patient: string
    new_encounter_date: string
    refresh_encounter_list: boolean
}

class EncounterPageImpl extends React.Component<EncounterPageProps, EncounterPageState> {
    constructor(props: EncounterPageProps) {
        super(props);
        this.state = {anchorEl: null, open: false, new_encounter_patient: '', new_encounter_date: '', refresh_encounter_list: false}
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleNewEncounter(event: MouseEvent<HTMLButtonElement>) {
        this.setState({anchorEl: event.currentTarget, open:true});
    }

    handleNewEncounterClose() {
    }

    handleSaveEncounter() {
        var createEncounter = firebase.functions().httpsCallable('createEncounter');
        var page = this;
        const encounterId = Math.floor(Math.random() * 1000000000).toString();
        createEncounter({'encounterId': encounterId, 'encounter': {'patient':this.state.new_encounter_patient, 'when':this.state.new_encounter_date }})
            .then(function(response) {
                console.log("Create Encounter Response: " + console.log(JSON.stringify(response.data)));
                page.setState(prevState => ({...prevState, refresh_encounter_list: !prevState.refresh_encounter_list}));
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
            <div className={this.props.classes.mainContainer}>
            <Button variant="contained" color="primary" onClick={(event: MouseEvent<HTMLButtonElement>)=>(this.handleNewEncounter(event))}>
                <Typography className={this.props.classes.typography}>New Encounter</Typography>
            </Button>
            <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                onClose={this.handleNewEncounterClose}
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
                        <TextField name="new_encounter_patient" onChange={this.handleInputChange} id="patient-name" label="Patient" />
                    </div>
                    <div>
                        <TextField
                            name="new_encounter_date"
                            id="datetime-local"
                            label="Time"
                            type="datetime-local"
                            defaultValue="2020-05-24T10:30"
                            className={this.props.classes.textField}
                            onChange={this.handleInputChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                </form>
                <Button variant="contained" onClick={()=>(this.handleSaveEncounter())}>Save</Button>
            </Popover>
            <EncounterList user={this.props.user} onVisit={this.props.onVisit} refresh={this.state.refresh_encounter_list} orderBy="" order=""></EncounterList>
            </div>
            </>
        );
    }
}


export const EncounterPage = withStyles(styles)(withRouter(EncounterPageImpl));