import { type Component, type JSX, Suspense } from "solid-js";
import { I18nProvider } from "./providers/I18nProvider";

const App: Component<{ children: JSX.Element }> = (props) => {
  return (
    <I18nProvider>
      <main class="flex-1">
        <Suspense>{props.children}</Suspense>
      </main>
    </I18nProvider>
  );
};

export default App;
