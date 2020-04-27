import React, {ChangeEvent, KeyboardEvent } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { startVideo } from "./video";
import { Role } from "./Role";
import { PatientMode } from "./PatientMode";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { green, blue, grey } from '@material-ui/core/colors';
import TextField from "@material-ui/core/TextField";
import {PreVisitQuestion, QuestionType} from "./PreVisitQuestion";

interface Props {
    encounterId: string;
    questions: Array<PreVisitQuestion>;
}

interface FinishedQuestionEntry {
    queryText: string;
    answer: string;
}

interface QuestionViewProps {
    queryText: string;
    current: boolean
}

function QuestionView({queryText, current} : QuestionViewProps) {
    const classes = useStyles();
    return (
        <div className={current ? classes.questionCurrent : classes.question}>{queryText}</div>
    );
}

interface AnswerViewProps {
    answerText: string;
}

function AnswerView({answerText} : AnswerViewProps) {
    const classes = useStyles();
    return (
        <div className={classes.finishedAnswer}>{answerText}</div>
    );
}

interface AnswerEntryProps {
    answer: string,
    onAnswer: (answer: string) => void;
}

function TextAnswerEntry({answer, onAnswer} : AnswerEntryProps) {
    const [editAnswer, setEditAnswer] = React.useState(answer);

    const handleAnswer = () => {
        onAnswer(editAnswer);
        setEditAnswer("");
    };
    const updateAnswer = (event: ChangeEvent<HTMLInputElement>) => {
        setEditAnswer(event.target.value);
        answer = event.target.value;
    }

    const keyPress = (e: KeyboardEvent) => {
        // Enter Key
        if(e.keyCode == 13) {
           handleAnswer();
        }
    };

    return (
        <>
        <TextField
            onChange={updateAnswer}
            onKeyDown={keyPress}
            value={editAnswer}
            fullWidth={true}
        />
        <Button onClick={handleAnswer}>Submit</Button>
        </>
    );
}

interface MultiChoiceAnswerEntryProps {
    options: Array<string>,
    onAnswer: (answer: string) => void;
}

function MultiChoiceAnswerEntry({options, onAnswer}: MultiChoiceAnswerEntryProps) {
    const classes = useStyles();
    const handleAnswer = (index: number) => {
        onAnswer(options[index]);
    };

    return (
        <>
        {options.map((option, index) => {
            return (<Button key={index} className={classes.suggestionChit} onClick={() => {handleAnswer(index)}}>{option}</Button>);
        })}
        </>
    );
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    container: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    finished: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'first',
        overflow: 'scroll',
    },
    question: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '8px',
        margin: '3px',
        color: theme.palette.getContrastText(blue[700]),
        backgroundColor: blue[700],
    },
    questionCurrent: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '8px',
        margin: '3px',
        color: theme.palette.getContrastText(blue[700]),
        backgroundColor: blue[700],
    },
    finishedAnswer: {
        padding: '4px 8px',
        borderRadius: '8px',
        textAlign: 'right',
        float: 'right',
        display: 'inline-block',
        margin: '3px',
        color: theme.palette.getContrastText(green[700]),
        backgroundColor: green[700],
    },
    allDoneMessage: {
        fontSize: '18pt',
        backgroundColor: 'white',
        padding: '10px',
        display: 'inline-block'
    }, 
    suggestionChit: {
        padding: '4px 8px',
        borderRadius: '8px',
        textAlign: 'right',
        float: 'right',
        display: 'inline-block',
        margin: '3px',
        color: theme.palette.getContrastText(green[700]),
        backgroundColor: green[700],
        "&:hover": {
            backgroundColor: green[900],
        },
    },
    spaceEater: {
        display: 'flex',
        flex: "5 0 auto"
    },
    hidden: {
        visibility: 'hidden'
    },
    finishedQuestion: {
        "&:hover": {
            backgroundColor: grey[500],
        },
    }
}));

export default function PreVisitWork(props: Props) {
    const classes = useStyles();
    const [finishedQuestions, setFinishedQuestions] = React.useState<Array<FinishedQuestionEntry>>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<number>(0);
    const [currentAnswer, setCurrentAnswer] = React.useState<string>("");
    const finishedRef = React.useRef<HTMLDivElement>(null);
    const handleAnswer = (answer: string) => {
        finishedQuestions.splice(currentQuestionIndex, 1, {
            queryText: props.questions[currentQuestionIndex].queryText,
            answer: answer
        });
        setCurrentAnswer("");
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };
    React.useEffect(() => {
        if (finishedRef.current) {
            finishedRef.current.scrollTop = finishedRef.current.scrollHeight;
        }
    }, [currentQuestionIndex]);

    const onClickFinished = (index: number) => {
        setCurrentQuestionIndex(index);
    }
    const questionsFinished = currentQuestionIndex >= props.questions.length;
    return (
        <>
        <div className={classes.container}>
            <div className={classes.spaceEater}></div>
            <div className={classes.finished} ref={finishedRef}>
                {finishedQuestions.map((question, index) => {
                    if (index < currentQuestionIndex) {
                        return (
                            <div key={index} className={classes.finishedQuestion} onClick={() => onClickFinished(index)}>
                                <div>
                                    <QuestionView current={false} queryText={question.queryText}></QuestionView>
                                </div>
                                <div>
                                    <AnswerView answerText={question.answer}></AnswerView>
                                </div>
                            </div>
                        );
                    } else {
                        return "";
                    }
                })}
            </div>
            <div>
                {questionsFinished ?
                    <QuestionView current={true} queryText="All set, your appointment will begin shortly!"></QuestionView>
                    : 
                    <QuestionView current={true} queryText={props.questions[currentQuestionIndex].queryText}></QuestionView>
                }
                <div className={questionsFinished ? classes.hidden : ""}>
                    {questionsFinished || props.questions[currentQuestionIndex].type === QuestionType.TEXT ?
                        <TextAnswerEntry 
                            answer={currentAnswer} 
                            onAnswer={handleAnswer}></TextAnswerEntry> 
                        :
                        <MultiChoiceAnswerEntry 
                            options={props.questions[currentQuestionIndex].options} 
                            onAnswer={handleAnswer}></MultiChoiceAnswerEntry>
                    }
                </div>
            </div>
        </div>
        </>
    );
}