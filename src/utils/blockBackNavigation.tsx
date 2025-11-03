import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useIonRouter } from "@ionic/react";
import { useHistory } from "react-router-dom"; // works with Ionic React < 7 (React Router v5)

export function useBlockNavigation(isUnsaved: boolean, onBlock: () => void) {
  const router = useIonRouter();
  const history = useHistory();

  useEffect(() => {
    // --- 1️⃣ Intercept HARDWARE BACK BUTTON ---
    const backHandler = (ev: CustomEvent) => {
      ev.detail.register(10, () => {
        if (isUnsaved) {
          onBlock?.();
        } else {
          if (router.canGoBack()) {
            router.goBack();
          } else {
            App.exitApp();
          }
        }
      });
    };

    document.addEventListener("ionBackButton", backHandler as EventListener);

    // --- 2️⃣ Intercept ROUTE NAVIGATION (like history.push, links, etc.) ---
    const unblock = history.block((tx: any) => {
      if (isUnsaved) {
        onBlock?.();
        return false; // block navigation
      }
      // only call retry if exists (older history types don’t include it)
      if (tx?.retry) {
        unblock();
        tx.retry();
      }
    });

    return () => {
      document.removeEventListener(
        "ionBackButton",
        backHandler as EventListener
      );
      unblock();
    };
  }, [isUnsaved, onBlock, router, history]);
}
