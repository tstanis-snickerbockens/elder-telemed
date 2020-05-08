import React from "react";
import {
    createStyles,
    Theme,
    makeStyles,
} from "@material-ui/core/styles";
import { Encounter, EncounterAudioAnnotation } from "./encounter";
import ClinicianAudioInsights, { Category, Type } from "./ClinicianAudioInsights";
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        flexGrow: 1,
    },
    tabPanel: {
        height: '100%'
    }
}));

interface ClinicianWorkAreaProps {
    encounter: Encounter,
    audioAnnotations: Array<EncounterAudioAnnotation>,
    onUpdateAnnotation: (index: number, e: EncounterAudioAnnotation) => void
}

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    var classes = useStyles();
    return (
        <div
            role="tabpanel"
            className={classes.tabPanel}
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box className={classes.tabPanel}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function ClinicianWorkArea({ encounter, audioAnnotations, onUpdateAnnotation }: ClinicianWorkAreaProps) {
    const classes = useStyles();
    const [tab, setTab] = React.useState(0);

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTab(newValue);
    };


    return (
        <>
            <Paper className={classes.root}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab style={{ minWidth: 50 }} label="Diagnosis" />
                    <Tab style={{ minWidth: 50 }}label="Medications" />
                    <Tab style={{ minWidth: 50 }} label="Tests" />
                    <Tab style={{ minWidth: 50 }} label="Procedures" />
                </Tabs>
            </Paper>
            <TabPanel value={tab} index={0}>
                <ClinicianAudioInsights onUpdateAnnotation={onUpdateAnnotation} category={Category.MEDICAL_CONDITION} annotations={audioAnnotations}></ClinicianAudioInsights>
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <ClinicianAudioInsights onUpdateAnnotation={onUpdateAnnotation} category={Category.MEDICATION} annotations={audioAnnotations}></ClinicianAudioInsights>
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <ClinicianAudioInsights onUpdateAnnotation={onUpdateAnnotation} category={Category.TEST_TREATMENT_PROCEDURE} type={Type.TEST_NAME} annotations={audioAnnotations}></ClinicianAudioInsights>
            </TabPanel>
            <TabPanel value={tab} index={3}>
                <ClinicianAudioInsights onUpdateAnnotation={onUpdateAnnotation} category={Category.TEST_TREATMENT_PROCEDURE} type={Type.PROCEDURE_NAME} annotations={audioAnnotations}></ClinicianAudioInsights>
            </TabPanel>
        </>
    );
}