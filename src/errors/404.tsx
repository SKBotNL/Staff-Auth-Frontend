import { FiXCircle } from "solid-icons/fi";

export default function NotFound() {
  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <FiXCircle class="h-16 w-full mb-8" />
      <p class="text-xl text-center">404 - Not Found</p>
    </div>
  );
}
