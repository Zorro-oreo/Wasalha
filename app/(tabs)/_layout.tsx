import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import History_act from '../../components/tabs/History_act.svg';
import History_inact from '../../components/tabs/History_in.svg';
import Home_active from '../../components/tabs/Home_active.svg';
import Home_inact from '../../components/tabs/Home_inactive.svg';
import Serv_act from '../../components/tabs/serv_act.svg';
import Serv_inact from '../../components/tabs/serv_in.svg';
import Settings_act from '../../components/tabs/set_act.svg';
import Settings_inact from '../../components/tabs/set_in.svg';

const TAB_COLOR_ACTIVE = '#B85A9A';
const TAB_COLOR_ACTIVE_TEXT = '#ffffff';
const TAB_COLOR_INACTIVE_TEXT = '#A8519E';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // ── Pill animation (same pattern as auth screen) ──
  const slideX = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const hasInit = useRef(false);

  // ── Hardcoded layout state, one per tab ──
  const [homeLayout, setHomeLayout] = useState({ x: 0, width: 0 });
  const [serviceLayout, setServiceLayout] = useState({ x: 0, width: 0 });
  const [historyLayout, setHistoryLayout] = useState({ x: 0, width: 0 });
  const [settingsLayout, setSettingsLayout] = useState({ x: 0, width: 0 });

  const activeRouteName = state.routes[state.index].name;

  const getLayoutForRoute = (name: string) => {
    switch (name) {
      case 'index': return homeLayout;
      case 'service': return serviceLayout;
      case 'history': return historyLayout;
      case 'settings': return settingsLayout;
      default: return { x: 0, width: 0 };
    }
  };

  const animateTo = (layout: { x: number; width: number }) => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: layout.x, duration: 250, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(slideWidth, { toValue: layout.width, duration: 250, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
    ]).start();
  };

  useEffect(() => {
    const target = getLayoutForRoute(activeRouteName);
    if (target.width === 0) return;
    if (!hasInit.current) {
      slideX.setValue(target.x);
      slideWidth.setValue(target.width);
      hasInit.current = true;
    } else {
      animateTo(target);
    }
  }, [activeRouteName, homeLayout, serviceLayout, historyLayout, settingsLayout]);

  const onHomeLayout = (e: LayoutChangeEvent) =>
    setHomeLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width });
  const onServiceLayout = (e: LayoutChangeEvent) =>
    setServiceLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width });
  const onHistoryLayout = (e: LayoutChangeEvent) =>
    setHistoryLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width });
  const onSettingsLayout = (e: LayoutChangeEvent) =>
    setSettingsLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width });

  const getLayoutHandler = (name: string) => {
    switch (name) {
      case 'index': return onHomeLayout;
      case 'service': return onServiceLayout;
      case 'history': return onHistoryLayout;
      case 'settings': return onSettingsLayout;
      default: return () => {};
    }
  };

  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'index': return focused ? <Home_active width={44} height={44} /> : <Home_inact width={44} height={44} />;
      case 'service': return focused ? <Serv_act width={44} height={44} /> : <Serv_inact width={44} height={44} />;
      case 'history': return focused ? <History_act width={44} height={44} /> : <History_inact width={44} height={44} />;
      case 'settings': return focused ? <Settings_act width={44} height={44} /> : <Settings_inact width={44} height={44} />;
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      <View style={styles.outerPill}>
        <Animated.View style={[styles.slidingPill, { left: slideX, width: slideWidth }]} />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onLayout={getLayoutHandler(route.name)}
              onPress={onPress}
            >
              {getIcon(route.name, isFocused)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="service" options={{ title: 'Service' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F3FB',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  outerPill: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    height: 64,
    borderRadius: 36,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 5,
    boxShadow: '0px 0px 0px 1px rgba(58, 49, 77, 0.2)',
  },
  slidingPill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    backgroundColor: '#B85A9A',
    borderRadius: 32,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Jakarta-Bold',
  },
});