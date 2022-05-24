import { Injectable, Inject } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { groupBy, keys } from 'ramda';
import { isNilOrEmpty } from './utility';
import { LoggerService } from '../logger/logger.service';

export interface Breadcrumb {
  label: string;
  url: string;
}
@Injectable({ providedIn: 'root' })
export class StoreService {
  isProduction: boolean;
  domain: any;
  localDomain = {};
  config: any;
  menu: any;
  domainMap: Map<number | string, any> = new Map();
  localDomainMap: Map<string | string, any> = new Map();
  configMap: Map<number | string, any> = new Map();
  codeValDataTransform = groupBy((data: any) => {
    return data.CategoryCodeID;
  });
  fileUploadList = [];
  removeAttachmentList = [];
  removeControlData: any[] = [];
  breadcrumbs!: Breadcrumb[];
  permissions: any;
  currentEntity!: string;
  routerLinkList: string[] = [];
  modelobjectDatat: any[] = [];
  currentSection: any;
  currentsectionId: any;
  // ---------
  parentID!: number;
  controlData: any[] = [];
  dialogModel: any[] = [];
  detailModel: any;
  updatedDetailModel: any;
  updatedListarray: any[] = [];
  activeTabIndex = 0;
  isPagePreview = false;
  PaginationDetails: any; // // Core Modified Added server side pagination for grid
  constructor(
    private logger: LoggerService,
    @Inject('environment') private Environment
  ) {
    this.isProduction = Environment.production;
  }
  getDomainValue(id: number) {}

  addToLocaldomain(node: any, localDomain: any[]) {
    this.localDomain[node] = localDomain;
    localDomain.map((data) => {
      this.localDomainMap.has(data.ID)
        ? null
        : this.localDomainMap.set(data.ID, data.value);
    });
  }
  setLocaldomain(data: readonly any[]) {
    if (isNilOrEmpty(data)) {
      this.localDomain = {};
      this.localDomainMap = new Map();
      return;
    }
    this.localDomain = this.codeValDataTransform(data);
    this.setLocalDomainMap();
  }
  setLocalDomainMap() {
    keys(this.localDomain).map((key) => {
      const local: any[] = this.localDomain[key];
      local.map((data) =>
        this.localDomainMap.set(`${key}-${data['ID']}`, data.value)
      );
    });

    this.logger.log(
      'Local Domain 15 Initialized for the pace ->',
      JSON.stringify(this.localDomainMap)
    );
  }
}
