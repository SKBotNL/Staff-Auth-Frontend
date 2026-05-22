export default function LoaderComponent({
  text,
  fillScreen,
}: {
  text: string;
  fillScreen: boolean;
}) {
  return (
    <div
      class={`flex flex-col ${fillScreen ? "min-h-screen" : ""} items-center justify-center gap-6`}
    >
      <span class="loading loading-spinner w-12"></span>
      <p class="text-lg text-center">{text}</p>
    </div>
  );
}
