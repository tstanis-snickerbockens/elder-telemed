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

interface EncounterRow {
    encounterId: string;
    patient: string;
    advocate: string;
    time: number;
    encounter_state : string;
    patient_connected : boolean;
    advocate_connected : boolean;
}

interface EncounterListProps extends RouteComponentProps<{}>, WithStyles<typeof styles> {
    orderBy: string;
    order: string;
    user: firebase.User | null;
}

interface EncounterListState {
  encounters: Array<EncounterRow>;
}

interface ListEncounterEntry {
    encounterId: string;
    patient: string;
    when: number;
}

class EncounterListImpl extends React.Component<EncounterListProps, EncounterListState>  {
    constructor(props: EncounterListProps) {
        super(props);
        console.log("EncounterListImpl");
        this.refreshEncounters();
        this.state = {encounters: []}
    }

    private headers = [
        { id: 'name', numeric: false, disablePadding: true, label: 'Patient Name' },
        { id: 'advocates', numeric: false, disablePadding: false, label: 'Advocates' },
        { id: 'time', numeric: false, disablePadding: false, label: 'Scheduled Time' },
        { id: 'encounter_state', numeric: false, disablePadding: false, label: 'State' },
        { id: 'patient_connected', numeric: false, disablePadding: false, label: 'Patient Connected' },
        { id: 'advocate_connected', numeric: false, disablePadding: false, label: 'Advocate Connected' },
        { id: 'go', numeric: false, disablePadding: false, label: 'Go' },
      ];

    componentDidMount() {
        this.refreshEncounters();
    }

    refreshEncounters() {
        console.log("refreshEncounters");
        let listEncounters = firebase.functions().httpsCallable('listEncounters');
        listEncounters({'userId': 'myuser'})
            .then(response => {
                let newEncounters = response.data.map((entry: ListEncounterEntry) => {
                    return {
                        encounterId: entry.encounterId,
                        patient: entry.patient,
                        advocate: "",
                        time: entry.when,
                        encounter_state : "",
                        patient_connected : false,
                        advocate_connected : false
                    }
                });
                this.setState((state) => {return {user:this.props.user, encounters:newEncounters}});
            }).catch(err => {
                console.log("ERROR: " + JSON.stringify(err))
            });
    }

    gotoEncounter(encounterId: string) {
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
                        {this.state.encounters.map((row) => (
                            <TableRow key={row.encounterId}>
                                <TableCell component="th" scope="row">
                                    {row.patient}
                                </TableCell>
                                <TableCell align="right">{row.advocate}</TableCell>
                                <TableCell align="right">{row.time}</TableCell>
                                <TableCell align="right">{row.encounter_state}</TableCell>
                                <TableCell align="right">{row.patient_connected}</TableCell>
                                <TableCell align="right">{row.advocate_connected}</TableCell>
                                <TableCell align="right"><a href="#" onClick={()=>(this.gotoEncounter(row.encounterId))}>Go</a></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

export const EncounterList = withStyles(styles)(withRouter(EncounterListImpl));