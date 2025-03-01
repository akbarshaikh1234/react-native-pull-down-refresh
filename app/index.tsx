import PullDownScrollView from "@/components/pullDownScrollVIew";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Index() {

  const [isRefreshing , setIsRefreshing] = useState(false);

  const delay = async (delay = 2000) => await new Promise((resolve) => setTimeout(resolve, delay));

  const refresh = async () => {
    setIsRefreshing(true);
    await delay(5000);
    setIsRefreshing(false);
  };

  return (
    // <View style={{ flex: 1 }}>
      <PullDownScrollView onRefresh={refresh} isRefreshing={isRefreshing}>
      {Array.from({ length: 100 }).map((_, index) => (
        <Text key={index}>{index}</Text>
      ))}
    </PullDownScrollView>
    // </View> 
    
  );
}
