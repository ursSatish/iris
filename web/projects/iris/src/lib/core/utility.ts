import {
  forEach,
  isEmpty,
  isNil,
  assoc,
  curry,
  keys,
  reduce,
  difference,
  identity,
  negate,
} from 'ramda';

export const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};

export const isNilOrEmpty = (val: any) => isNil(val) || isEmpty(val);
export const isNotNilOrEmpty = (val: any) => !isNilOrEmpty(val);
export const isNullobject = (val: any) => keys(val).length === 0;
export const properCase = (text: any) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const toDomainMap = (data: any) => {
  let domainMap: Map<number | string, any> = new Map();
  forEach((e: any) => domainMap.set(e['ID'], e['value']), data);
  return domainMap;
};
export const toConfigMap = (data: any) => {
  let configMap: Map<number | string, any> = new Map();
  forEach((e: any) => configMap.set(e['ID'], e['value']), data);
  return configMap;
};

export const FillRouterList = (routeList: any, isStartNewFill: boolean) => {
  let routerLinkList: string[] = [];
  if (isStartNewFill) {
    routerLinkList = [];
  }
  routeList.Routes.forEach((routeItem: any) => {
    if (!isNilOrEmpty(routeItem)) {
      routerLinkList.push(
        routerLinkList.push(
          routeItem.Route.startsWith('/')
            ? routeItem.Route.substr(1, routeItem.Route.length)
            : routeItem.Route
        )
      );
    }
  });
  return routerLinkList;
};

export const dateFormatUTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
export const dateFormatMMDDYYY = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
export const dateFormatOnly = /^\d{2}\/\d{2}\/\d{4}$/;

export const reviver = (key, value) => {
  key = key;
  return typeof value === 'string' &&
    (dateFormatMMDDYYY.test(value) || dateFormatOnly.test(value))
    ? new Date(value)
    : value;
};

export const pathToText = (str) => {
  return str
    .split('-')
    .map(function capitalize(part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
};
export const minDate = new Date(1560, 2, 10);
export const maxDate = new Date(Date.now());

export const titleCase = (string) => {
  string = string.replace(/([a-z])([A-Z])/g, '$1 $2');
  string = string.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return string;
};

export const dateFormat = 'yyy-MM-ddThh:mm:ss.SSS';

export const renameKeys = curry((keysMap, obj)=> reduce(acc,key)=>assoc(keysMap[key]|| keys,obj[key],acc), {},keys(obj));

export function objectEqual(newVal, oldVal, exclude =[]){
  // if both are function
  if(newVal instanceof Function){
    if(oldVal instanceof Function){
      return newVal.toString() === oldVal.toString();
    }
    return false;
  }

  // Date Check
  if(newVal instanceof Object && !isNaN(newVal)){
    if(
      new Date(newVal).toDateString() === new Date(oldVal).toDateString() ||
      new Date(newVal).toJSON() === new Date(oldVal).toJSON() ||
      new Date(newVal).toJSON() === new Date(null).toJSON()
    ){
      return true;
    }
  }

  if(newVal === null || newVal === undefined || oldVal === null || oldVal === undefined){
    return newVal === oldVal;
  }

  if(newVal === oldVal || newVal.valueOf() === oldVal.valueOf()){
    return true;
  }

  // if one of them is date, they must had equal valueof
  if(newVal instanceof Date){
    return false;
  }
  if(oldVal instanceof Date){
    return false;
  }

  //if they are not function or strictly equal, they both need to objects
   if(!(newVal instanceof Object)){
    return false;
  }
  if(!(oldVal instanceof Object)){
    return false;
  }

  const p = difference(Object.keys(newVal), exclude);
  return difference(Object.keys(oldVal), exclude).every(i=>p.indexOf(i) !== -1)
  ? p.every(i=> objectEqual(newVal[i],oldVal[i]))
  : false;

}

export const isValidDate = (date) => {
  return(date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date));
}

// Returns URL values as an Array
export const GetHyperLinkValues = (defaultValue: string): any[] => {
  const parseJSON = (!isNilOrEmpty(defaultValue))? JSON.parse(defaultValue): identity(0);
  const retArray = [];
  if(!isNilOrEmpty(parseJSON) && Array.isArray(parseJSON.DefaultValue)){
    retArray.push(GetJSONObjValue(parseJSON, Object.keys(parseJSON)[0], 'RedirectURL'));
    retArray.push(GetJSONObjValue(parseJSON, Object.keys(parseJSON)[0], 'ParamValue'));
  }
  return retArray;
}

export const GetJSONObjValue =(JSONObj: any, RootKey: string, childKey: string): string =>{
  return JSONObj[RootKey].find(val => val[childKey])[childKey];
}

//Generate Unique values based on parameters
export const pad =(n, width, z='0'){
  z =z || '0';
  n= n + '';
  return n.length >= width ? n: new Array(width - n.length +1).join(z) +n;
}

export const setDateTimeAcctoTimeZone = (value: Date, timezoneoffsetinminuts: number) => {
  let hours: number = timezoneoffsetinminuts/ 60;
  const minutes: number = timezoneoffsetinminuts %60;
  hours = parseInt(hours.toString());
  let finalDate = new Date(value);
  finalDate.setHours(negate(hours));
  finalDate.setMinutes(negate(minutes));
  finalDate.setSeconds(0);
  return finalDate;
}
