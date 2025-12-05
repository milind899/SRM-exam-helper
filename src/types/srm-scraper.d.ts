declare module '@extension/srm-scraper' {
    export function scrapeAllData(): Promise<any>;
    export function scrapeUserProfile(doc?: any): any;
    export function scrapeExamSchedule(doc?: any): any[];
    export function scrapeAcademicHistory(doc?: any): any[];
}
