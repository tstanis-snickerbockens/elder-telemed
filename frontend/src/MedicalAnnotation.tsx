import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    popover: {
      pointerEvents: 'none',
    },
    paper: {
      padding: theme.spacing(1),
    },
    annotation: {
        textDecoration: 'underline',
    }
  }),
);

export enum AnnotationEntityCategory {
    MEDICAL_CONDITION = "MEDICAL_CONDITION",
    TIME_TO_MEDICATION_NAME = "TIME_TO_MEDICATION_NAME",
    MEDICATION = "MEDICATION",
    TEST_TREATMENT_PROCEDURE = "TEST_TREATMENT_PROCEDURE",
    TIME_EXPRESSION = "TIME_EXPRESSION"

}

export enum AnnotationEntityType {
    DX_NAME = "DX_NAME",
    BRAND_NAME = "BRAND_NAME",
    TEST_NAME = "TEST_NAME",
    TIME_TO_TEST_NAME = "TIME_TO_TEST_NAME"
}

export enum AnnotationEntityTraitName {
    SIGN = "SIGN",
    SYMPTOM = "SYMPTOM",
    NEGATION = "NEGATION",
    DIAGNOSIS = "DIAGNOSIS"
}

export enum AnnotationEntityAttributeRelationshipType {
    DOSAGE = "DOSAGE",
    FREQUENCY = "FREQUENCY",

    TEST_VALUE = "TEST_VALUE",

    OVERLAP = "OVERLAP"
}

export enum AnnotationEntityAttributeType {
    DOSAGE = "DOSAGE",
    FREQUENCY = "FREQUENCY",
    STRENGTH = "STRENGTH",
    ROUTE_OR_MODE = "ROUTE_OR_MODE",

    TEST_VALUE = "TEST_VALUE",
    PROCEDURE_NAME = "PROCEDURE_NAME",

    BRAND_NAME = "BRAND_NAME"
}

export enum AnnotationEntityAttributeCategory {
    MEDICATION = "MEDICATION",
    TEST_TREATMENT_PROCEDURE = "TEST_TREATMENT_PROCEDURE"
}

export interface AnnotationEntityTrait {
    Name: AnnotationEntityTraitName;
    Score: number;
}

export interface AnnotationEntityAttribute {
    Type: AnnotationEntityAttributeType;
    Category: AnnotationEntityAttributeCategory;
    Score: number;
    RelationshipScore: number;
}

export interface AnnotationEntity {
    Id: number;
    BeginOffset: number;
    EndOffset: number;
    Score: number;
    Text: string;
    Category: AnnotationEntityCategory;
    Type: AnnotationEntityType;
    Traits: Array<AnnotationEntityTrait>;
    Attributes?: Array<AnnotationEntityAttribute>;
}

interface MedicalAnnotationProps {
    entity: AnnotationEntity;
}

export function MedicalAnnotation(props: MedicalAnnotationProps) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
        <span className={classes.annotation} onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
            {props.entity.Text}
        </span>
        <Popover
            className={classes.popover}
            classes={{
            paper: classes.paper,
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            onClose={handlePopoverClose}
            >
            <Typography>
                {props.entity.Text}<br/>
                Category: {props.entity.Category}<br/>
                Type: {props.entity.Type}
            </Typography>
        </Popover>
        </>
    )
}