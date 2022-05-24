import { FormlyFieldConfig } from '@ngx-formly/core';
import { keys } from 'ramda';
import { isNilOrEmpty } from '../core/utility';

export function sanitizePageMetaData(
  fields: FormlyFieldConfig[],
  isDialogInstance
) {
  if (!isDialogInstance) return;
  if (!fields[1] || !fields[1]['templateOptions']['buttons']) return;

  fields[1]['templateOptions']['buttons'] = fields[1]['templateOptions'][
    'buttons'
  ].replace('BACK', '');
  fields[1]['templateOptions']['buttons'] = fields[1]['templateOptions'][
    'buttons'
  ].replace('REFRESH', '');
}

export function modelHasRecordsToSave(model): boolean {
  let hasChanges = false;
  keys(model).map((key) => {
    if (key === 'SearchCriteria') return;
    hasChanges = hasChanges || (isNilOrEmpty(model[key]) ? false : true);
  });
  model = keys(model).map((key) =>
    model[key] instanceof Array
      ? (model[key] = model[key].filter((e) => e))
      : null
  );
  return hasChanges;
}

export function removeUnmodifiedRecords(model, originalModel): any {
  keys(model).map((key) => {
    if (Array.isArray(model[key])) {
      model[key].map((item, index) => {
        try {
          if (
            JSON.stringify(item) === JSON.stringify(originalModel[key][index])
          )
            delete model[key][index];
        } catch {}
      });
      model[key] = model[key].filter((e) => e);
    } else if (
      JSON.stringify(model[key]) === JSON.stringify(originalModel[key])
    ) {
      if (key !== 'SearchCriteria') model[key] = {};
    }
  });
}
