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

export interface AnnotationEntity {
    Id: number,
    BeginOffset: number,
    EndOffset: number,
    Score: number,
    Text: string,
    Category: string,
    Type: string
}

interface MedicalAnnotationProps {
    entity: AnnotationEntity
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