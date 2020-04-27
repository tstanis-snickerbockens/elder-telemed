export enum QuestionType {
    TEXT = 0,
    MULTI_CHOICE = 1
}

export interface PreVisitQuestion {
    type: QuestionType,
    queryText: string,
    options: Array<string>,
}