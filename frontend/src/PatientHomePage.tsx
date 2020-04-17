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
import { Role } from './Role';
import { green } from '@material-ui/core/colors';

const styles = (theme: Theme) => createStyles({
    root: {
        inWidth: 275,
        padding: 25,
        height: '100%',
        width: '100%',
    },
    title: {
        paddingTop: '16px',
        paddingLeft: '13px',
        paddingBottom: '14px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'black',
        backgroundColor: '#D3DCE9',
    },
    pos: {
        marginBottom: 12,
    },
    pictures: {
        marginLeft: 'auto',
        width: 'max-content'
    },
    card: {
        width: '70vw',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    description: {
        float: 'left',
        width: 'max-content'
    },
    button: {
        width: 'max-content',
        margin: '0 auto',
        display: 'block',
        color: theme.palette.getContrastText(green[700]),
        backgroundColor: green[700],
        '&:hover': {
          backgroundColor: green[900],
        },
      },
});

interface PatientHomePageProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
  user: firebase.User;
  onStartAppointment: (encounterId: string, role: Role) => void;
};

interface PatientHomePageState {
    encounterId: string | null;
    role: Role;
}

class PatientHomePageImpl extends React.Component<PatientHomePageProps, PatientHomePageState> {
    constructor(props: PatientHomePageProps) {
        super(props);
        this.state = {encounterId: null, role: Role.PATIENT}
        this.startAppointment = this.startAppointment.bind(this);
    }
    componentDidMount() {
        console.log("User: " + this.props.user.email);
        let queryEncounters = firebase.functions().httpsCallable('queryEncounters');
        queryEncounters({'patientId': this.props.user.email, advocate: this.props.user.email})
            .then(response => {
                console.log("Encounters: " + JSON.stringify(response.data));
                if (response.data && response.data.length > 0) {
                    let advocate = response.data[0].encounter.advocate;
                    console.log("Advocate: " + advocate);
                    let role = this.props.user.email === advocate ? Role.ADVOCATE : Role.PATIENT;
                    console.log("Our role:" + role);
                    this.setState({encounterId: response.data[0].encounterId, role: role});
                }
            });
    }
    
    startAppointment() {
        if (this.state.encounterId) {
            this.props.onStartAppointment(this.state.encounterId, this.state.role);
        }
    }

    render() {
        return (
          <>  
            <Grid container justify="center" alignItems="center" className={this.props.classes.root} spacing={2}>
                <Card className={this.props.classes.card}>
                    <Typography className={this.props.classes.title} color="textSecondary" gutterBottom>
                    <img alt='' src='alarm_clock.png'/>
                    It's time to start your doctor's visit.
                    </Typography>
                    <CardContent>
                        <div className={this.props.classes.description}>
                            <Typography variant="h5" component="h2">
                            <b>Dr. Terry Hahn</b><br/>
                            Cardiology Follow-up<br/>
                            Today at 8:30am<br/>
                            </Typography>
                        </div>
                        <div className={this.props.classes.pictures}>
                            <img alt='' src="doctor_circle.png"/>
                            <img alt='' src="advocate_circle.png"/>
                        </div>
                        <Button size='large' variant="contained" onClick={this.startAppointment} color="primary" className={this.props.classes.button}>
                            Begin Video Visit
                        </Button>
                        
                    </CardContent>
                </Card>
            </Grid>
             
          </>
        );
    }
};

export const PatientHomePage = withStyles(styles)(withRouter(PatientHomePageImpl));