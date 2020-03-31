import React from "react";
import {
  RouteComponentProps,
  withRouter
} from "react-router-dom";
import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core/styles";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import firebase from "firebase";


const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 750,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
});

interface PatientRow {
    email: string;
    name: string;
    advocate: string;
}

interface PatientListProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
    orderBy: string;
    order: string;
    user: firebase.User | null;
    refresh: boolean; // Used to force refresh from server.
}

interface PatientListState {
  patients: Array<PatientRow>;
}

interface ListPatientEntry {
    patientEmail: string;
    patient: {
        name: string;
        advocate: string;
    }
}

class PatientListImpl extends React.Component<PatientListProps, PatientListState>  {
    constructor(props: PatientListProps) {
        super(props);
        this.state = {patients: []}
    }

    private headers = [
        { id: 'email', numeric: false, disablePadding: true, label: 'Email' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'advocates', numeric: false, disablePadding: false, label: 'Advocates' }
      ];

    componentDidMount() {
        this.refreshPatients();
    }

    componentWillReceiveProps(props: PatientListProps) {
        if (props.refresh !== this.props.refresh) {
          this.refreshPatients();
        }
      }

      refreshPatients() {
        console.log("refreshPatients");
        let listPatients = firebase.functions().httpsCallable('listPatients');
        listPatients({'userId': 'myuser'})
            .then(response => {
                let newPatients = response.data.map((entry: ListPatientEntry) => {
                    console.log(JSON.stringify(entry))
                    return {
                        email: entry.patientEmail,
                        name: entry.patient.name,
                        advocate: entry.patient.advocate,
                    }
                });
                this.setState((state) => {return {patients:newPatients}});
            }).catch(err => {
                console.log("ERROR: " + JSON.stringify(err))
            });
    }
    

    render() {
        return (
            <TableContainer component={Paper}>
                <Table className={this.props.classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {this.headers.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    padding={headCell.disablePadding ? 'none' : 'default'}
                                >
                                    {headCell.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.patients.map((row) => (
                            <TableRow key={row.email}>
                                <TableCell component="th" scope="row">
                                    {row.email}
                                </TableCell>
                                <TableCell align="right">{row.name}</TableCell>
                                <TableCell align="right">{row.advocate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

export const PatientList = withStyles(styles)(withRouter(PatientListImpl));