"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { DashboardPreview } from "./dashboard-preview";

export const Hero = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/signup");
  };

  const handleHowItWorks = () => {
    // Scroll to features section or navigate to about page
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-24 md:pt-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Badge>✨ نظام ذكي للدراسة</Badge>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              أنت لا تحتاج إلى ساعات أكثر...
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                تحتاج إلى خطة أذكى.
              </span>
            </h1>

            <p className="max-w-xl text-lg text-secondary md:text-xl">
              Study Bac يساعدك على تنظيم كل يوم دراسي حتى تصل إلى البكالوريا
              بثقة ووضوح. خطتك الذكية تنتظرك.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="px-8"
                onClick={handleGetStarted}
              >
                ابدأ رحلتك الآن
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8"
                onClick={handleHowItWorks}
              >
                كيف يعمل؟
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-primary/20 to-accent/20"
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold">+١٠٠٠ طالب</p>
                <p className="text-sm text-secondary">يستخدمون Study Bac</p>
              </div>
            </div>
          </motion.div>

          {/* Right Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </Container>
    </section>
  );
};