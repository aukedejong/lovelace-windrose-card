export class Log {

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
                this.error('Unkonwn log level set: ', level, ' default to NONE');
                break;
        }
        if (this.level > 0) {
            console.log('LOG level set to:', level);
        }
    }

    static checkLogLevel(logLevel: string | undefined): string {
        if (logLevel === undefined) {
            return 'NONE';
        }
        if (logLevel === 'NONE' || logLevel === 'ERROR' || logLevel === 'WARN' || logLevel === 'INFO' ||
            logLevel === 'DEBUG' || logLevel === 'TRACE') {
            return logLevel;
        }
        throw new Error('Unkonwn log level configurated: ' + logLevel);
    }

    static error(message: any, ...optionalParams: any[]): void {
        if (this.level >= 1) {
            if (optionalParams.length === 0) {
                console.error('ERROR ' + message);
            } else {
                console.error('ERROR ' + message, optionalParams[0]);
            }
        }
    }

    static warn(message: any, ...optionalParams: any[]): void {
        if (this.level >= 2) {
            if (optionalParams.length === 0) {
                console.warn('WARN ' + message);
            } else {
                console.warn('WARN ' +message, optionalParams[0]);
            }
        }
    }

    static info(message: any, ...optionalParams: any[]): void {
        if (this.level >= 3) {
            this.log('INFO ' + message, optionalParams);
        }
    }

    static debug(message: any, ...optionalParams: any[]): void {
        if (this.level >= 4) {
            this.log('DEBUG ' + message, optionalParams);
        }
    }

    static trace(message: any, ...optionalParams: any[]): void {
        if (this.level === 5) {
           this.log('TRACE ' + message, optionalParams);
        }
    }

    private static log(message: any, ...optionalParams: any[]): void {
        if (optionalParams[0].length === 0) {
            console.log(message);
        } else {
            console.log(message, optionalParams[0]);
        }
    }
}