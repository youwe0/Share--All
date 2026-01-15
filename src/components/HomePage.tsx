import { motion } from "framer-motion";
import { useAppContext } from "../hooks/useAppContext";
import { Button, Card, GridBackground, HeroGlow, Badge } from "./ui";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Lock,
  Upload,
  QrCode,
  Server,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function HomePage() {
  const { setMode } = useAppContext();

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <HeroGlow />
      <GridBackground variant="lines" fade className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="accent" dot pulse>
                No servers. No limits. Just transfer.
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-gradient">Serverless.</span>
              <br />
              <span className="text-dark-text">Secure. Instant.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-dark-muted max-w-2xl mx-auto mb-10"
            >
              Transfer files of any size directly between browsers.
              <span className="text-dark-text-secondary">
                {" "}
                No uploads. No waiting. No traces.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                glow
                onClick={() => setMode("create")}
                icon={<Upload className="w-5 h-5" />}
              >
                Send a File
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setMode("join")}
                icon={<QrCode className="w-5 h-5" />}
              >
                Receive a File
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex items-center justify-center gap-8 text-dark-subtle text-sm"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 line-through opacity-50" />
                <span>No server storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Multi-GB support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-dark-border rounded-full flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 bg-dark-accent rounded-full" />
            </motion.div>
          </motion.div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
                How P2P Transfer Works
              </h2>
              <p className="text-dark-muted max-w-xl mx-auto">
                Three simple steps to transfer files directly to anyone,
                anywhere.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create a Room",
                  description:
                    "Generate a unique room and get a QR code to share with your recipient.",
                  icon: QrCode,
                },
                {
                  step: "02",
                  title: "Connect Directly",
                  description:
                    "Your recipient scans the QR code and establishes a direct peer-to-peer connection.",
                  icon: Globe,
                },
                {
                  step: "03",
                  title: "Transfer Instantly",
                  description:
                    "Files transfer directly between browsers with real-time progress tracking.",
                  icon: Zap,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="default"
                    hover
                    className="h-full relative overflow-hidden group"
                  >
                    {/* Step number */}
                    <span className="absolute top-4 right-4 text-6xl font-bold text-dark-border group-hover:text-dark-accent/20 transition-colors">
                      {item.step}
                    </span>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-dark-accent/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-dark-accent" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-dark-text mb-2">
                      {item.title}
                    </h3>
                    <p className="text-dark-muted">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-dark-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
                Built for Privacy & Speed
              </h2>
              <p className="text-dark-muted max-w-xl mx-auto">
                Enterprise-grade security meets blazing fast transfers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Zero Knowledge",
                  description:
                    "We never see, store, or have access to your files.",
                },
                {
                  icon: Lock,
                  title: "WebRTC Encrypted",
                  description:
                    "Military-grade DTLS encryption on all transfers.",
                },
                {
                  icon: Zap,
                  title: "No Size Limits",
                  description: "Transfer multi-GB files without restrictions.",
                },
                {
                  icon: Globe,
                  title: "Cross Platform",
                  description: "Works on any modern browser, any device.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-linear-to-br from-dark-accent/20 to-transparent flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-dark-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-muted text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" padding="lg" className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-4">
                  Ready to transfer?
                </h2>
                <p className="text-dark-muted mb-8 max-w-lg mx-auto">
                  Start transferring files securely in seconds. No account
                  required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    glow
                    onClick={() => setMode("create")}
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    Start Sending
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-dark-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-lavender to-rose flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-dark-text">P2P Share</span>
            </div>
            <p className="text-dark-subtle text-sm">
              Peer-to-peer file transfer. No servers. No limits.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
