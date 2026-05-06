import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from "@react-navigation/native";
import type { RootStackParamList } from "./AppNavigator";

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (!navigationRef.isReady()) {
    return;
  }

  (navigationRef.navigate as unknown as (
    screen: RouteName,
    params?: RootStackParamList[RouteName],
  ) => void)(
    name,
    params,
  );
}

export function push<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.dispatch(StackActions.push(name, params));
}

export function refreshRoute<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params: RootStackParamList[RouteName],
) {
  if (!navigationRef.isReady()) {
    return;
  }

  const currentRoute = navigationRef.getCurrentRoute();

  if (currentRoute?.name === name) {
    navigationRef.dispatch(CommonActions.setParams(params as object));
    return;
  }

  (navigationRef.navigate as unknown as (
    screen: RouteName,
    params: RootStackParamList[RouteName],
  ) => void)(
    name,
    params,
  );
}
