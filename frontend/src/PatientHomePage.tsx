import React, { } from "react";
import {
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';

const styles = (theme: Theme) => createStyles({
    root: {
        inWidth: 275,
        padding: 25,
        height: '100%',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

interface PatientHomePageProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  user: firebase.User;
  onStartAppointment: (encounterId: string) => void;
};

interface PatientHomePageState {
    encounterId: string | null;
}

class PatientHomePageImpl extends React.Component<PatientHomePageProps, PatientHomePageState> {
    constructor(props: PatientHomePageProps) {
        super(props);
        this.state = {encounterId: null}
        this.startAppointment = this.startAppointment.bind(this);
    }
    componentDidMount() {
        console.log("Patient: " + this.props.user.email);
        let queryEncounters = firebase.functions().httpsCallable('queryEncounters');
        queryEncounters({'patientId': this.props.user.email})
            .then(response => {
                console.log("Patient's Encounters: " + JSON.stringify(response.data));
                if (response.data && response.data.length > 0) {
                    this.setState({encounterId: response.data[0].encounterId});
                }
            });
    }
    
    startAppointment() {
        if (this.state.encounterId) {
            this.props.onStartAppointment(this.state.encounterId);
        }
    }

    render() {
        return (
          <>  
            <Grid container justify="center" alignItems="center" className={this.props.classes.root} spacing={2}>
                <Card>
                    <CardContent>
                        <Typography className={this.props.classes.title} color="textSecondary" gutterBottom>
                        Time to Check In!
                        </Typography>
                        <Typography variant="h5" component="h2">
                        Followup with Dr. Foo
                        </Typography>
                        <Typography className={this.props.classes.pos} color="textSecondary">
                        Tuesday March 20, 10:20am
                        </Typography>
                        <Typography variant="body2" component="p">
                        Your doctor’s office and health partner will be able to see and hear you.
                        </Typography>
                        <Button variant="contained" onClick={this.startAppointment} color="primary">
                            Start Appointment
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
             
          </>
        );
    }
};

export const PatientHomePage = withStyles(styles)(withRouter(PatientHomePageImpl));