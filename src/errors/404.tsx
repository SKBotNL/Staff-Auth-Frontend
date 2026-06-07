import NotFoundIcon from "~icons/tabler/error-404";

export default function NotFound() {
  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <NotFoundIcon class="h-16 w-full mb-8" />
      <p class="text-xl text-center">Not Found</p>
    </div>
  );
}
