import { Hero } from "@/components/sections/Hero";

/**
 * Home page.
 *
 * Intentionally minimal: only the Hero is mounted. Future sections
 * (Projects, About, Contact) will be added here as their own components
 * — e.g. `<ProjectsGrid />`, `<About />`, `<Contact />` — once built,
 * keeping this file a simple composition root rather than a place where
 * section markup accumulates directly.
 */
export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
