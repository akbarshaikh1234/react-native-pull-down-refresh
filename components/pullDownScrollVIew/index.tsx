import React, { PropsWithChildren } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type PullDownScrollViewProps = {
  isRefreshing?: boolean;
  onRefresh: () => void; // Required prop
};

const MAX = 100;
const FRICTION_RATIO = 0.52;

const PullDownScrollView = (
  props: PropsWithChildren<PullDownScrollViewProps>
) => {
  const { children, onRefresh, isRefreshing = false } = props;

  const scrollY = useSharedValue(0);
  const pullDown = useSharedValue(0);
  const refreshOffset = useSharedValue(-100);

  const onScroll = Gesture.Native();

  const onGesture = Gesture.Pan()
    .onChange((event) => {
      if (scrollY.value <= 0 && event.translationY > 0) {
        const frictionFactor =
          1 - Math.min(event.translationY / MAX, 1) * FRICTION_RATIO;
        pullDown.value = event.translationY * frictionFactor;

        refreshOffset.value = pullDown.value - 80;
      }
    })
    .onFinalize(() => {
      if (pullDown.value > MAX && !isRefreshing) {
        runOnJS(onRefresh)();
      }
      pullDown.value = withTiming(0, { duration: 250, easing: Easing.linear });
      refreshOffset.value = withTiming(0, {
        duration: 240,
        easing: Easing.linear,
      });
    });

  const composedGesture = Gesture.Simultaneous(onScroll, onGesture);

  const animatedScrollStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: pullDown.value,
        },
      ],
      flexGrow: 1,
      overflow: pullDown.value ? "hidden" : "scroll",
    };
  });

  const animatedRefreshIndicatorStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: refreshOffset.value,
        },
      ],
      opacity: isRefreshing ? 1 : Math.max(0, 1 - 20 / pullDown.value),
      position: isRefreshing ? "relative" : "absolute",
    };
  });

  const onScrollView = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <GestureHandlerRootView style={styles.gestureRootContainer}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.refreshIndicatorAnimationContainer,
            animatedRefreshIndicatorStyles,
          ]}
        >
          <Animated.View style={[styles.refreshContainer]}>
            <ActivityIndicator size="small" color="#000" />
            <Text>{isRefreshing ? "Refreshing..." : "Release to Refresh"}</Text>
          </Animated.View>
        </Animated.View>

        <GestureDetector gesture={composedGesture}>
          <Animated.ScrollView
            style={[styles.scrollView, animatedScrollStyles]}
            onScroll={onScrollView}
            scrollEventThrottle={16}
            // Disabled iOS bounce effect for consistency
            bounces={false}
          >
            {children}
          </Animated.ScrollView>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

export default PullDownScrollView;

const styles = StyleSheet.create({
  gestureRootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  refreshContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
  },
  refreshIndicatorAnimationContainer: {
    position: "absolute",
    transform: [{ translateY: -100 }],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
    padding: 10,
    opacity: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});
