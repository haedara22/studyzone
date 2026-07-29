import { siteConfig } from "@/config/site";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <Container>
        <div className="flex flex-col gap-3 py-8 text-sm text-secondary md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
            جميع الحقوق محفوظة.
          </p>

          <p>
            مساعدك الذكي نحو النجاح في البكالوريا.
          </p>

        </div>
      </Container>
    </footer>
  );
}