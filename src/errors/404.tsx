import NotFoundIcon from "~icons/tabler/error-404";

export default function NotFound() {
  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <NotFoundIcon class="h-16 w-full" />
      <p class="text-xl text-center font-bold">Not Found</p>
    </div>
  );
}
