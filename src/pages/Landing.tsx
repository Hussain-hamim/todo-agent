import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, ClipboardList, Rocket, Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className='relative overflow-hidden min-h-screen  text-white'>
      <section className='relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-24 sm:pb-16 text-center'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-3xl text-5xl font-extrabold tracking-tight sm:text-7xl
            bg-gradient-to-r from-blue-400 via-green-400 to-cyan-400
            bg-clip-text text-transparent drop-shadow-[0_0_10px_rgb(255,192,203)]'
        >
          UnknownAi
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className='mx-auto mt-6 max-w-2xl text-white/80 sm:text-lg leading-relaxed'
        >
          Automate your day with UnknownAi — add tasks, organize ideas, and get
          instant help from your personal AI assistant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='mt-10 flex items-center justify-center gap-5'
        >
          <Link
            to='/agent'
            className='btn-glass inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold
            bg-white/10 hover:bg-white/20 text-white shadow-lg transition duration-300'
          >
            <Brain size={20} /> Try UnknownAi
          </Link>
          <Link
            to='/work'
            className='btn-glass inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold
             text-[#1E2A38]  shadow-lg transition duration-300'
          >
            <ClipboardList size={20} /> Go to Work
          </Link>
        </motion.div>
      </section>

      <section className='relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-20 sm:grid-cols-3'>
        {[
          {
            title: 'Smart Tasks',
            desc: 'Add, complete, and organize tasks instantly with AI.',
            icon: <Rocket size={20} />,
          },
          {
            title: 'Visual Whiteboard',
            desc: 'Sketch ideas, map flows, and brainstorm on the go.',
            icon: <Sparkles size={20} />,
          },
          {
            title: 'Actionable Agent',
            desc: 'UnknownAi understands and executes your commands.',
            icon: <Brain size={20} />,
          },
        ].map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: idx * 0.15,
              type: 'spring',
              stiffness: 120,
            }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            className='card-glass cursor-pointer p-6 rounded-xl border border-white/20 shadow-md
              flex flex-col gap-3 hover:shadow-purple-500/50 transition-shadow'
          >
            <div className='flex items-center gap-3 text-purple-400 font-semibold text-lg'>
              {f.icon}
              {f.title}
            </div>
            <p className='text-white/80'>{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
