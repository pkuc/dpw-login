export interface UserDataRow {
    'First Name': string,
    'Last Name': string,
    'Email': string
}

declare global {
    interface UserDataRow {
        containsAny(value: string): Date;
    }
}