import { Location, formatDate } from '@angular/common';
import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { isNil, replace, keys, groupBy, clone } from 'ramda';
import { BehaviorSubject, forkJoin, Observable, of, identity } from 'rxjs';
import { PageBuilderService } from '../core/page-builder.service';
import { StoreService } from '../core/store.service';
import { LoggerService } from '../logger/logger.service';
import { GenericService } from '../core/generic.service';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { UserNotificationService } from '../core/user-notification.service';
import { LoadingService } from '../core/loading.service';
import { map, debounce, debounceTime } from 'rxjs/operators';
import {
  isNotNilOrEmpty,
  isNilOrEmpty,
  objectEqual,
  reviver,
  isValidDate,
  dateFormat,
  toDomainMap,
  FillRouterList,
  toConfigMap,
} from '../core/utility';
import { DialogInteractionService } from '../core/dialog-interaction.service';
import {
  sanitizePageMetaData,
  modelHasRecordsToSave,
  removeUnmodifiedRecords,
} from './page-util';
import { SubSink } from 'subsink';
import { MessageService } from '../core/message.service';
import { GenericFrameworkService } from '../core/generic-framework.service';
import { ThemeService } from '@progress/kendo-angular-charts';
import { element } from 'protractor';

export interface StepType {
  label: string;
  childTabs?: [];
  parentTabId?: number;
  ID?: number;
  parentSectionID?: number;
  groupName?: string;
  fields: FormlyFieldConfig[];
  child?: [];
  childGroups?: any[];
  childGroupKeys?: any[];
  sectionStatus?: number;
  baseSectionID?: number;
  isValid: boolean;
}

@Component({
  selector: 'iris-base-form',
  template: '',
})
export class PageBaseFormComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  protected subs = new SubSink();
  id: number | string;
  steps: StepType[] = [];
  form: FormGroup | FormArray = new FormGroup({});
  model: any = {};
  originalModel: any = {};
  options: FormlyFormOptions = {
    formState: { userAction$: new BehaviorSubject<string>('') },
  };
  detailComponents: any = [];
  fields: FormlyFieldConfig[];
  isDialogInstance = false;
  editiedRecordForDialog: any;
  isTabbedForm = false;
  modelData: FormData;
  NavOnSuccessSubit = false;

  @ViewChild('container', { read: ViewContainerRef })
  public containerRef: ViewContainerRef;

  protected messageService: MessageService;
  protected pageBuilderService: PageBuilderService;
  protected activatedRoute: ActivatedRoute;
  protected storeService: StoreService;
  protected location: Location;
  protected logger: LoggerService;
  protected router: Router;
  protected dialogRef: DialogRef;
  protected notificationService: UserNotificationService;
  protected loadingService: LoadingService;
  protected dialogService: DialogService;
  protected dialogInterationService: DialogInteractionService;
  protected entity: string;
  protected type: string;
  protected isSubscriptionsSetupDone = false;
  protected genericFrameworkService: GenericFrameworkService;

  constructor(
    protected injector: Injector,
    protected actionService: GenericService
  ) {
    this.initializeServices();
  }

  ngOnInit(): void {
    this.storeService.isPagePreview = false;
    this.storeService.PaginationDetails = {};
    this.loadingService.setLoading(true);
    this.subs.sink = this.options.formState.userAction$.subscribe((action) =>
      this._OnButtonPalletClick(action)
    );

    if (this.isDialogInstance) {
      this.dialogInterationService.initialize();
      return;
    }

    this.subs.sink = this.dialogInterationService.dialogUserAction$.subscribe(
      (action) => this.onDialogUserAction(action)
    );

    this.subs.sink = this.activatedRoute.params.subscribe(() => {
      const urlSegments = this.router.url.split('/').slice(-2);
      this.entity = isNaN(parseInt(urlSegments[1], 10))
        ? urlSegments[1]
        : urlSegments[0];
      this.id = isNaN(parseInt(urlSegments[1], 10)) ? null : urlSegments[1];
      this.type = isNilOrEmpty(this.id) ? 'List' : 'Detail';
      this.pageLoad();
      this.storeService.currentEntity = this.entity;
      this.storeService.updatedDetailModel = [];
    });
  }

  ngAfterViewChecked(): void {
    if (isNotNilOrEmpty(this.form.controls) && !this.isSubscriptionsSetupDone) {
      this.actionService.setupSubscriptions(this);
      this.isSubscriptionsSetupDone = true;
    }
  }

  protected fieldsTransform() {}

  public pageLoad() {
    this.storeService.currentEntity = this.entity;
    this.actionService.prePageLoad(this);

    const pageName = this.entity + this.type;

    const SearchCriteria =
      isNotNilOrEmpty(this.model) &&
      isNotNilOrEmpty(this.model['SearchCriteria'])
        ? this.model['SearchCriteria']
        : {};

    this.subs.sink = forkJoin([
      this.pageBuilderService.get(pageName),
      this.type === 'List'
        ? this.actionService.search(SearchCriteria, this.entity)
        : this.actionService.get(this.id, this.entity),
    ]).subscribe(([fields, model]) => {
      this.actionService.onPageLoadingStart(this, fields, model);
      if (isNotNilOrEmpty(fields)) {
        if (isNotNilOrEmpty(fields[0]['LocalDomain'])) {
          this.storeService.setLocaldomain(fields[0]['LocalDomain']);
        }
        // If tabbed form then the below logic is assigned
        if (this.isTabbedForm) {
          this.steps = [];
          // push fields to steps
          fields.forEach((field) => {
            if (!field.parentSectionID) {
              const label = field.TabName ? field.TabName : field.key;
              this.steps.push({
                label: label,
                ID: field.ID,
                parentSectionID: field.parentSectionID,
                groupName: field.groupName,
                fields: [field],
                isValid: true,
              });
            }
          });

          // Identify child tabs and map
          this.steps.forEach((tabField) => {
            if (tabField.ID) {
              tabField.child = [];
              this.findchildTabs(tabField, fields);
            }
          });

          this.fields = fields.slice(0);
          this.form = new FormArray(
            this.steps.map(
              (step) => new FormGroup({ [step['key']]: new FormGroup({}) })
            )
          );
        } else {
          this.fields = fields.slice(0);
        }
        sanitizePageMetaData(this.fields, this.isDialogInstance);
      }
      this.model = JSON.parse(JSON.stringify(model), reviver);

      // Added serve side pagination for grid
      if (this.type === 'List' && isNotNilOrEmpty(this.model)) {
        this.model.SearchCriteria = SearchCriteria;
        this.storeService.PaginationDetails = isNotNilOrEmpty(
          this.model.PaginationDetails
        )
          ? this.model.PaginationDetails
          : {};
        if (isNotNilOrEmpty(SearchCriteria)) {
          Object.assign(this.storeService.PaginationDetails, SearchCriteria);
        }
      }
      this.originalModel = JSON.parse(JSON.stringify(this.model));

      this.actionService.FieldsTransform(this);
      this._configureGrids();
      this.loadingService.setLoading(false);
      this.actionService.postPageLoad(this);
      this.actionService.populateLocalDomain();
      this.addDialogDatatoGrid();
    });
  }

  addDialogDatatoGrid() {
    if (!this.isDialogInstance) {
      this.storeService.detailModel = this.model;
      //
      if (this.type === 'Detail') {
        if (isNotNilOrEmpty(this.storeService.updatedDetailModel)) {
          Object.assign(this.model, this.storeService.updatedDetailModel);
        }
      }
      if (isNotNilOrEmpty(this.storeService.dialogModel)) {
        this.storeService.dialogModel.forEach((i) => {
          if (isNotNilOrEmpty(this.model[i.entity])) {
            if (isNilOrEmpty(i.data.ID) && i.data.ID > -1) {
              const index = this.model[i.entity].findIndex(
                (r) => r.ID === i.data.ID
              );
              if (index > -1) {
                this.model[i.entity][index] = i.data;
              }
            } else if (isNotNilOrEmpty(i.data.rowId)) {
              const index = this.model[i.entity].findIndex(
                (r) => r.rowId === i.data.rowId
              );
              if (index > -1) {
                this.model[i.entity][index] = i.data;
              }
            } else {
              i.data.rowId = Date.now();
              this.model[i.entity].push(i.data);
            }
          } else {
            i.data.rowId = Date.now();
            Object.assign(this.model, { [i.entity]: [i.data] });
          }
        });
      }
      this.storeService.detailModel = [];
    } else {
      if (
        isNilOrEmpty(this.model) &&
        isNotNilOrEmpty(this.editiedRecordForDialog.data)
      ) {
        this.model[this.entity] = this.editiedRecordForDialog.data;
      } else {
        isNotNilOrEmpty(this.editiedRecordForDialog.data)
          ? Object.assign(
              this.model[this.editiedRecordForDialog.entity],
              this.editiedRecordForDialog.data
            )
          : identity(0);
      }
    }
  }
  setGroupTabs(TabList) {
    TabList.map((tt) => {
      if (tt.hasOwnProperty('child') && isNotNilOrEmpty(tt.child)) {
        tt.childGroups == this.groupChildsByGroupName(tt.child);
        tt.childGroupKeys = [];
        tt.childGroupKeys = keys(tt.childGroups);

        this.setGroupTabs(tt.child);
      }
    });
  }

  findChildTabs(tabField, fields) {
    tabField.child = [];
    const childFields = fields.filter(
      (field) => field.parentSectionID === tabField.ID
    );
    if (isNotNilOrEmpty(childFields)) {
      childFields.forEach((childField) => {
        if (isNotNilOrEmpty(childField)) {
          if (childField.wrapper === 'panel') {
            if (tabField.fields != null) {
              tabField.fields.push(childField);
            } else {
              Object.assign(tabField, { fields: [childField] });
            }
          } else {
            if (tabField.fields != null) {
              let fieldPushed = false;
              tabField.fields.forEach((element) => {
                if (
                  element.hasOwnProperty('child') &&
                  element.child.length > 0
                ) {
                  const rowIndex = element.child.findIndex(
                    (row) => row.GroupName === childFields.GroupName
                  );
                  if (rowIndex > -1) {
                    Object.assign(childField, { fields: [childField] });
                    element.child.push(childField);
                    fieldPushed = true;
                  }
                }
              });
              if (!fieldPushed) {
                Object.assign(childField, { fields: [childField] });
                tabField.fields.push({ child: [childField] });
              }
            } else {
              Object.assign(childField, { fields: [childFields] });
              Object.assign(tabField, { fields: [{ child: [childField] }] });
            }
          }
          this.findChildTabs(childField, fields);
        }
      });
    }
  }
  groupChildsByGroupName = groupBy((data: any) => {
    return data.groupName;
  });

  public initializeFormForDialog(
    data: any,
    settings = {},
    SearchCriteria = {}
  ) {
    this.isDialogInstance = true;
    if (isNotNilOrEmpty(settings)) {
      this.type = settings['type'];
      if (this.type === 'List') this.model.SearchCriteria = SearchCriteria;
      // In case we are using the component, then use the entity of the component rather than use the passed in entity
      this.entity = isNilOrEmpty(settings['entity'])
        ? this.entity
        : settings['entity'];
      this.editiedRecordForDialog = { data, entity: settings['entity'] };
      this.id = SearchCriteria['id'];
    }
    this.pageLoad();
  }

  private _configureGrids() {
    this.actionService.setGridDetailComponents(this);
    if (isNilOrEmpty(this.fields)) return;

    this.fields.map((e) => {
      if (!isNil(e.fieldGroup) && e.fieldGroup[0].type === 'grid') {
        e.fieldGroup[0]['templateOptions']['onPreGridAction'] = (
          element,
          $event: any,
          dataItem: any
        ) => this.actionService.onPreGridAction(element, $event, dataItem);
        e.fieldGroup[0]['templateOptions']['onClick'] = (
          element,
          $event: any,
          dataItem: any,
          editFormGroup: any
        ) => this._gridAction(element, $event, dataItem);
        e.fieldGroup[0]['templateOptions']['popupComponents'] =
          this.detailComponents;
      }
    });
  }

  private _gridAction(element, event, dataItem) {
    this.logger.log(`Event from Grid and the data is `, event, dataItem);
    this.actionService.onPreGridAction(element, event, dataItem);
    if (event.code === 'SAVE' || event.code === 'DELETE') {
      this.actionService.gridPreSave(this, element, event, dataItem);
      this.subs.sink = this.actionService
        .save({ [element]: dataItem }, this.entity)
        .subscribe(() => {
          this.notificationService.success(
            this.messageService.getNotificatinMessage(
              'Success',
              event.code,
              this.entity
            )
          );
          this.logger.log(dataItem, 'Grid  Row Saved Sucessfully');
          this.pageLoad();
        });
    } else if (event.code === 'TOGGLE') {
      const itemStatus = dataItem.IsActive ? 'Disable' : 'Enable';
      this.subs.sink = this.actionService
        .toggle({ [element]: dataItem }, this.entity)
        .subscribe(() => {
          this.notificationService.success('Task' + itemStatus + 'Successfull');
          this.logger.log(dataItem, 'Grid Row' + itemStatus + 'Sucessfully');
          this.pageLoad();
        });
    } else if (event.code === 'POPUP_CLOSE') {
      this.subs.sink = this.actionService
        .search({ ID: dataItem.ID }, this.entity)
        .subscribe((e) => (this.model = e));
    } else if (event.code === 'REFRESH') {
      this._onButtonPalletClick(event.code);
    } else if (event.code === 'SYNC_CONTROLS') {
      this.subs.sink = this.actionService
        .get(null, 'SyncControls')
        .subscribe(() => {
          this.notificationService.success('Sync Successfull');
        });
    }
    this.actionService.postGridAction(this);
  }

  private _onButtonPalletClick(action: any) {
    const actionStatus = this.actionService.preButtonPalletClick(action);
    if (!actionStatus) return;
    action = action.trim();
    if (isNilOrEmpty(action)) return;

    this.logger.log(
      `User has initiated the ${JSON.stringify(action)} through button pallet`
    );
    switch (action) {
      case 'SAVE':
      case 'SUBMIT':
      case 'APPROVE':
      case 'REJECT':
      case 'ADD':
        //
        //
        if (this.isDialogInstance && this.dialogRef) {
          setTimeout(() => this.save(action), 50);
        } else {
          const dialogRef = this.dialogService.open({
            appendTo: this.containerRef,
            title: 'Confirmation!',
            content: 'Do you want to save the changes?',
            actions: [{ text: 'Yes', primary: true }, { text: 'No' }],
          });

          this.subs.sink = dialogRef.result.subscribe((response) => {
            if (response['primary']) {
              setTimeout(() => this.save(action), 50);
            }
          });
        }
        //
        break;
      case 'REFRESH':
        //
        this.pageLoad();
        break;
      case 'RESET':
        this.form.reset();
        this.pageLoad();
        break;
      case 'SEARCH':
        this.pageLoad();
        break;
      case 'BACK':
        this.logger.log(`user tried to navigate back`);
        this.location.back();
        break;
      case 'CANCEL':
        if (this.isDialogInstance && this.dialogRef) {
          this.dialogInterationService.gridSelectedRows = [];
          this.dialogRef.close();
        }
        this.actionService.onButtonPalletClick();
        this.pageLoad();
        break;
      case 'ADDNEW':
        this.logger.log(`user tried to Add New Record`);
        const newURL = replace(
          new RegExp(this.model.ID, 'g'),
          'new',
          this.router.url
        );
        this.model = {};
        this.options.resetModel({ ID: 'new' });
        this.location.go(newURL);
        //
        break;
      default:
        this.actionService.onButtonPalletClick();
        if (this.isDialogInstance && this.dialogRef) {
          //
          this.dialogInterationService.dialogUserAction$.next({
            action,
            model: this.dialogInterationService.gridSelectedRows,
          });
        }
    }
  }

  newURL = (oldID: string, newID: string) =>
    replace(oldID, newID, this.router.url);

  validate(): string[] {
    return [];
  }

  onDialogUserAction(action) {}

  public save(action?: string) {
    this.logger.log(`user tried to save the information`, this.model);
    if (
      this.actionService.preValidate(this) ||
      this.form.invalid ||
      this.validate().length > 0
    ) {
      this.notificationService.error(
        this.messageService.getNotificatinMessage(
          'Failure',
          action,
          this.entity
        )
      );
      return;
    }
    //
    if (!modelHasRecordsToSave(this.model)) {
      this.pageLoad();
      return;
    }
    //Appends selected grid rows to the end payload
    if (
      !isNilOrEmpty(this.editiedRecordForDialog) &&
      Array.isArray(this.editiedRecordForDialog.data)
    )
      this.model = {
        ...this.model,
        selectedRows: this.editiedRecordForDialog.data,
      };

    //undefined check for uploaded files = removeCollection code related
    if (
      isNotNilOrEmpty(this.storeService.fileUploadList) &&
      this.storeService.fileUploadList.length > 0
    ) {
      this.FileUpload();
      return;
    }

    this.actionService.preSave(this); // Give opportunity to the child component to make any changes to the model before save

    if (
      isNotNilOrEmpty(this.storeService.removeAttachmentList) &&
      this.storeService.removeAttachmentList.length > 0
    ) {
      this.model = {
        ...this.model,
        removeCollection: this.storeService.removeAttachmentList,
      };
    }
    if (action === 'ADD') {
      this.storeService.dialogModel.push({
        entity: this.entity,
        data: clone(this.model[this.entity]),
      });
      if (this.isDialogInstance && this.dialogRef) {
        this.dialogRef.close();
      }
      return;
    }
    this.storeService.dialogModel = [];
    this.subs.sink = this.actionService
      .save(this.model, this.entity)
      .subscribe(() => {
        this.notificationService.success(
          this.messageService.getNotificatinMessage(
            'Success',
            action,
            this.entity
          )
        );
        this.actionService.postSave(this);
        this.logger.log(
          this.messageService.getNotificatinMessage(
            'Success',
            action,
            this.entity
          )
        );
        this.GetAppData(this.entity);
        this.NavOnSuccessSubit = true;
        if (this.isDialogInstance) {
          this.dialogRef.close();
          this.dialogInterationService.gridSelectedRows = [];
          isNotNilOrEmpty(this.editiedRecordForDialog.data)
            ? Object.assign(
                this.editiedRecordForDialog.data,
                this.model[this.editiedRecordForDialog.entity]
              )
            : identity(0);
        }
        if (this.type === 'List') {
          this.storeService.updatedDetailModel = [];
          this.pageLoad();
          this.options.resetModel();
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.options.formState.userAction$) {
      this.options.formState.userAction$.unsubscribe();
    }
  }

  private initializeServices() {
    this.loadingService = this.injector.get(LoadingService);
    this.pageBuilderService = this.injector.get(PageBuilderService);
    this.location = this.injector.get(Location);
    this.storeService = this.injector.get(StoreService);
    this.logger = this.injector.get(LoggerService);
    this.router = this.injector.get(Router);
    this.dialogRef = this.injector.get(DialogRef);
    this.notificationService = this.injector.get(UserNotificationService);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.dialogService = this.injector.get(DialogService);
    this.dialogInterationService = this.injector.get(DialogInteractionService);
    this.messageService = this.injector.get(MessageService);
    this.genericFrameworkService = this.injector.get(GenericFrameworkService);
  }

  public canDeactivate(): Observable<boolean> | boolean {
    if (this.type === 'List') return of(true);

    let isPristine = true;
    if (!this.NavOnSuccessSubit) {
      keys(this.model).map((key) => {
        const isKeyValueEqual = objectEqual(
          this.model[key],
          this.originalModel[key]
        );
        if (!isKeyValueEqual && key !== 'SearchCriteria')
          isPristine = isPristine && false;
      });

      if (!isPristine) {
        const dialogRef = this.dialogService.open({
          appendTo: this.containerRef,
          title: 'Confirmation!',
          content: 'Do you want to save the changes?',
          actions: [{ text: 'Yes', primary: true }, { text: 'No' }],
        });
        return dialogRef.result.pipe(
          map((action) => (action['primary'] ? false : true))
        );
      }
    }
    return of(true);
  }

  public FileUpload(): void {
    this.modelData = new FormData();

    this.storeService.fileUploadList.forEach((data, index) => {
      this.modelData.append('file' + index.toString(), data);
    });

    for (const key in this.model[this.entity + this.type]) {
      if (key.toLocaleLowerCase() !== 'UploadFileName') {
        let value = this.model[this.entity + this.type][key];
        value = isValidDate(value)
          ? formatDate(value, dateFormat, 'en-US')
          : value;
        this.modelData.append(key, value);
      }
    }

    if (this.storeService.removeAttachmentList.length > 0) {
      this.modelData.append(
        'removeCollection',
        JSON.stringify(this.storeService.removeAttachmentList)
      );
    }

    this.subs.sink = this.actionService
      .post(this.entity, 'Upload', this.modelData)
      .subscribe(() => {
        this.notificationService.success(
          'Task Saved and File Uploaded Sucessfully'
        );
        this.actionService.postSave(this);
        this.logger.log('file uploaded Sucessfully');
        if (this.isDialogInstance) {
          this.dialogRef.close();
          isNotNilOrEmpty(this.editiedRecordForDialog.data)
            ? Object.assign(
                this.editiedRecordForDialog.data,
                this.model[this.editiedRecordForDialog.entity]
              )
            : identity(0);
        }
        this.pageLoad();
      });
  }

  private GetAppData(entity): void {
    let appReq = null;
    if (entity.toUpperCase() === 'DOMAIN') {
      appReq = 'Domain';
    } else if (
      entity.toUpperCase() === 'PAGEAPI' ||
      entity.toUpperCase() === 'PAGEAPIPERMISSION'
    ) {
      appReq = 'RoleApiPermission';
    } else if (
      entity.toUpperCase() === 'MENUPERMISSION' ||
      entity.toUpperCase() === 'PAGE'
    ) {
      appReq = 'Menu';
    } else if (entity.toUpperCase() === 'APPLICATIONSETTING') {
      appReq = 'AppSettings';
    }
    if (appReq != null) {
      this.subs.sink = this.genericFrameworkService
        .search({}, appReq, false)
        .pipe(debounceTime(100))
        .subscribe(
          (appData) => {
            if (appReq === 'Domain') {
              this.storeService.domain = this.storeService.codeValDataTransform(
                appData.Domain
              );
              this.storeService.domainMap = toDomainMap(appData.Domain);
            } else if (appReq === 'RoleApiPermission') {
              this.storeService.permissions = appData;
            } else if (appReq === 'Menu') {
              this.storeService.menu = appData;
              this.storeService.routerLinkList = FillRouterList(
                this.storeService.menu,
                true
              );
            } else if (appReq === 'AppSettings') {
              this.storeService.configMap = toConfigMap(appData.AppSettings);
              this.storeService.config = appData.AppSettings.reduce(
                (obj, item) => ((obj[item.ConfigKey] = item.ConfigValue), obj),
                {}
              );
            }
            this.redirectToPrevious();
          },
          (error) => {
            console.log('Error occured while getting' + appReq);
          }
        );
    } else {
      this.redirectToPrevious();
    }
  }

  redirectToPrevious() {
    if (this.type === 'Detail' && !this.isDialogInstance) {
      this.location.back();
      return;
    }
  }
}
