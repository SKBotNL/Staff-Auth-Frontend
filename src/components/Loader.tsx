export default function LoaderComponent(props: {
  text: string;
  fillScreen: boolean;
}) {
  return (
    <div
      class={`flex flex-col ${props.fillScreen ? "min-h-screen" : ""} items-center justify-center gap-6`}
    >
      <span class="loading loading-spinner w-12"></span>
      <p class="text-lg text-center">{props.text}</p>
    </div>
  );
}
