import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, ClipboardList, Rocket, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className='relative overflow-hidden'>
      <AnimatedBackground />
      <section className='relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-24 sm:pb-16 text-center'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl'
        >
          UnknownAi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className='mx-auto mt-4 max-w-2xl text-white/80 sm:text-lg'
        >
          Automate your day with UnknownAi — add tasks, organize ideas, and get
          instant help from your personal AI assistant.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='mt-8 flex items-center justify-center gap-3'
        >
          <Link to='/agent' className='btn inline-flex gap-2'>
            <Brain size={18} /> Try UnknownAi
          </Link>
          <Link
            to='/work'
            className='btn inline-flex gap-2 bg-white text-[#1E2A38] hover:bg-white/90'
          >
            <ClipboardList size={18} /> Go to Work
          </Link>
        </motion.div>
      </section>

      <section className='relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-3'>
        {[
          {
            title: 'Smart Tasks',
            desc: 'Add, complete, and organize tasks instantly with AI.',
            icon: <Rocket size={18} />,
          },
          {
            title: 'Visual Whiteboard',
            desc: 'Sketch ideas, map flows, and brainstorm on the go.',
            icon: <Sparkles size={18} />,
          },
          {
            title: 'Actionable Agent',
            desc: 'UnknownAi understands and executes your commands.',
            icon: <Brain size={18} />,
          },
        ].map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 * idx }}
            className='card'
          >
            <div className='mb-2 inline-flex items-center gap-2 text-sm text-white/70'>
              {f.icon}
              {f.title}
            </div>
            <div className='text-white/80'>{f.desc}</div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className='pointer-events-none absolute inset-0'>
      <div className='animate-blob-slow absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl' />
      <div className='animate-blob-slow absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_100%)]' />
    </div>
  );
}
