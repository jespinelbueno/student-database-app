
import StudentsPage from "./students/page";

export default function Home() {
  return (
    <div className="bg-zinc-100 grid grid-rows-[20px_1fr_20px] m-auto justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <StudentsPage></StudentsPage>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
