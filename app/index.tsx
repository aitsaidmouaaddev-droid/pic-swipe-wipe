import LoadingScreen  from "@ui/loading-screen/LoadingScreen";

export default function Index() {
  return (
    <LoadingScreen
      progress={25}
      loadingText="Scanning media…"
      logoSource={require("../assets/logo.png")}
      logoSize={500}
    />
  );
}