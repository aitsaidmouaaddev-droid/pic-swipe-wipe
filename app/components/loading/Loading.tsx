import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import LoadingScreen from "../../screens/loading-screen/LoadingScreen";

const HOME_TAB_ROUTE = "/(tabs)/HomeTab";
const LOGO_SOURCE = require("../../../assets/logo.png");
const LOADING_TEXT = "Scanning media…";

export default function Loading() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 50);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (progress === 100) router.replace(HOME_TAB_ROUTE);
    }, [progress]);

    return (
        <LoadingScreen
            progress={progress}
            loadingText={LOADING_TEXT}
            logoSource={LOGO_SOURCE}
        />
    );
}