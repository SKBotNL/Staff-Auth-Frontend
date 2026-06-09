import { Show } from "solid-js";

export default function LoaderComponent(props: {
  text?: string;
  fillScreen: boolean;
}) {
  return (
    <div
      class={`flex flex-col ${props.fillScreen ? "min-h-screen" : ""} items-center justify-center gap-6`}
    >
      <span class="loading loading-dots w-12"></span>
      <Show when={props.text}>
        {(text) => <p class="text-lg text-center">{text()}</p>}
      </Show>
    </div>
  );
}
