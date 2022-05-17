import { Inject, Injectable } from '@angular/core';
import { LoggerLevel, LoggerUtils } from './message.utils';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(@Inject('environment') private environment: any) {
    // setInterval(()=> this.clearMessage(),60000);
  }
  public trace(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.TRACE, message, additional);
  }
  public debug(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.DEBUG, message, additional);
  }
  public info(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.INFO, message, additional);
  }
  public log(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.LOG, message, additional);
  }
  public warn(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.WARN, message, additional);
  }
  public error(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.ERROR, message, additional);
  }
  public fatal(message: any, ...additional: any[]): void {
    this.logMessage(LoggerLevel.FATAL, message, additional);
  }

  logToConsole(log: any) {
    const color = LoggerUtils.getColor(log.level);

    switch (log.level) {
      case LoggerLevel.WARN:
        console.warn(
          `%c${log.metaString}`,
          `color:${color}`,
          log.message,
          ...log.additional
        );
        break;
      case LoggerLevel.ERROR:
      case LoggerLevel.FATAL:
        console.error(
          `%c${log.metaString}`,
          `color:${color}`,
          log.message,
          ...log.additional
        );
        break;
      case LoggerLevel.INFO:
        console.error(
          `%c${log.metaString}`,
          `color:${color}`,
          log.message,
          ...log.additional
        );
        break;
      // case LoggerLevel.TRACE:
      //   console.error(
      //     `%c${log.metaString}`,
      //     `color:${color}`,
      //     log.message,
      //     ...log.additional
      //   );
      //   break;
      // case LoggerLevel.DEBUG:
      //   console.error(
      //     `%c${log.metaString}`,
      //     `color:${color}`,
      //     log.message,
      //     ...log.additional
      //   );
      //   break;
      default:
        console.log(
          `%c${log.metaString}`,
          `color:${color}`,
          log.message,
          ...log.additional
        );
    }
  }

  private getLogObject(message: any, additional: any[], level: LoggerLevel) {
    message = LoggerUtils.prepareMessage(message);
    // only use validated parameters for HTTP requests
    const validatedAdditionalParameters =
      LoggerUtils.prepareAdditionalParameters(additional);
    const timestamp = new Date().toISOString();
    const callerDetails = LoggerUtils.getCallerDetails();
    const metaString = LoggerUtils.prepareMetaString(
      timestamp,
      level,
      callerDetails.fileName,
      callerDetails.lineNumber
    );
    const messageObject = {
      metaString,
      message,
      additional: validatedAdditionalParameters,
      level,
      timestamp,
      fileName: callerDetails.fileName,
      lineNumber: callerDetails.lineNumber,
    };

    return messageObject;
  }

  private addToLocalStore(logObject: any) {
    const logMessages: any[] =
      JSON.parse(localStorage.getItem('logMessages')!) || [];
    logMessages.push(logObject);
    localStorage.setItem('logMessages', JSON.stringify(logMessages));
  }
  getConfiguredLevel() {
    return this.environment.logLevel;
  }

  private logMessage(
    level: LoggerLevel,
    message: any,
    additional: any[] = [],
    logOnServer: boolean = true
  ): void {
    if (level >= this.getConfiguredLevel()) {
      return;
    }
    const logObject: any = this.getLogObject(message, additional, level);
    this.logToConsole(logObject);
    // this.addToLocalStore(logObject);
  }

  private clearMessages() {
    let logMessages: any[] = JSON.parse(localStorage.getItem('logMessages')!);
    this.info(logMessages);
    logMessages = [];
    localStorage.setItem('logMessages', JSON.stringify(logMessages));
  }
}
