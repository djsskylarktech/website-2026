import Link from "next/link";

export const metadata = { title: "Sponsors | DJS Skylark" };

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-[#11191d] px-[5vw] py-8 text-[#f2f0e9]">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between border-b border-white/20 pb-6 text-sm">
        <Link href="/"><img src="/brand/djs-skylark-official-light.png" alt="DJS Skylark home" className="h-14 w-auto" /></Link>
        <Link href="/" className="text-[#b2c5c5] hover:text-white">← Back to home</Link>
      </header>
      <section className="mx-auto max-w-[1500px] pt-[clamp(100px,15vw,220px)]">
        <span className="text-xs uppercase tracking-[.2em] text-[#c19b5c]">DJS Skylark</span>
        <h1 className="mt-7 text-[clamp(64px,12vw,180px)] leading-[.9] tracking-[-.075em]">Sponsors<span className="text-[#b2c5c5]">.</span></h1>
      </section>
    </main>
  );
}
