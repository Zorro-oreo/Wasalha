import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getSession } from "../utils/session";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setHasSession(!!session);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) {
    return null;
}
  return hasSession ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)" />;
}
