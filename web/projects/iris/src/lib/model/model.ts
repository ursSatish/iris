import { guid } from '@progress/kendo-angular-common';

export namespace IrisModels {
  export class Context {
    constructor(
      public lanId = null,
      public firstName = null,
      public lastName = null,
      public bearerToken: string = '',
      public authenticated = false
    ) {}
  }
  export class UserInfo {
    userName = '';
    Id = '';
    userId = '';
    lanId = '';
    userProfileImage = '';
    bearerToken = '';
    isAuthenticated = false;
    lastLogin = new Date();
    userRoles: any[] = [];
    userLOBS: any[] = [];
    DistributionListID = '';
    activeRole = '';
    activeLob = '';
    defaultRoleID = '';
    defaultLOBID = '';
    activeRoleID = '';
    activeLOBID = '';
    activeRoleDetails: any;
  }
  export class IrisContext {
    appId: any; //TODO: How to add this
    sessionId: string = guid();
    activityId: string = guid();
    userInfo: UserInfo = new UserInfo();
    showSessionTimeoutDialog = false;
  }
  export class IdleSessionConfig {
    idle: any;
    timeout: any;
    ping: any;
  }
}
