import { JSX, Suspense, type Component } from "solid-js";

const App: Component<{ children: JSX.Element }> = (props) => {
  return (
    <>
      <main class="flex-1">
        <Suspense>{props.children}</Suspense>
      </main>
    </>
  );
};

export default App;
