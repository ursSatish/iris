import { forEach, isEmpty, isNil } from 'ramda';

export const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};

export const isNilOrEmpty = (val: any) => isNil(val) || isEmpty(val);
export const isNotNilOrEmpty = (val: any) => !isNilOrEmpty(val);

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
