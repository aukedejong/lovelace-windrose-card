export class Log2 {

    static level = 0;
    static setLevel(level: string) {
        switch(level) {
            case 'NONE': this.level = 0; break;
            case 'ERROR': this.level = 1; break;
            case 'WARN': this.level = 2; break;
            case 'INFO': this.level = 3; break;
            case 'DEBUG': this.level = 4; break;
            case 'TRACE': this.level = 5; break;
            default:
                this.level = 0;
                console.log('WR ERROR Unkonwn log level set: ', level, ' default to WARN');
                break;
        }
        if (this.level > 2) {
            console.log('WR LOG level set to:', level);
        }
    }

    static checkLogLevel(logLevel: string | undefined): string {
        if (logLevel === undefined) {
            return 'WARN';
        }
        if (logLevel === 'NONE' || logLevel === 'ERROR' || logLevel === 'WARN' || logLevel === 'INFO' ||
            logLevel === 'DEBUG' || logLevel === 'TRACE') {
            return logLevel;
        }
        throw new Error('Unkonwn log level configurated: ' + logLevel);
    }

    constructor(private readonly prefix: string) {

    }

    public error(message: any, ...optionalParams: any[]): void {
        if (Log2.level >= 1) {
            this.log("ERROR", message, optionalParams);
        }
    }

    public warn(message: any, ...optionalParams: any[]): void {
        if (Log2.level >= 2) {
            this.log("WARN", message, optionalParams);
        }
    }

    public info(message: any, ...optionalParams: any[]): void {
        if (Log2.level >= 3) {
            this.log('INFO', message, optionalParams);
        }
    }

    public debug(message: any, ...optionalParams: any[]): void {
        if (Log2.level >= 4) {
            this.log('DEBUG', message, optionalParams);
        }
    }

    public trace(message: any, ...optionalParams: any[]): void {
        if (Log2.level === 5) {
           this.log('TRACE', message, optionalParams);
        }
    }

    private log(level: string, message: any, ...optionalParams: any[]): void {
        if (optionalParams[0].length === 0) {
            console.log('WR ' + level + " " + this.prefix + ": " + message);
        } else {
            console.log('WR ' + level + " " + this.prefix + ": " + message, optionalParams[0]);
        }
    }

}
