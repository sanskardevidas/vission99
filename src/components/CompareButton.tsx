import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';

interface CompareButtonProps {
  projectId: string;
}

export default function CompareButton({
  projectId,
}: CompareButtonProps) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const compareProjects = JSON.parse(
      localStorage.getItem('compareProjects') || '[]'
    );

    setSelected(compareProjects.includes(projectId));
  }, [projectId]);

  function handleCompare() {
    const compareProjects = JSON.parse(
      localStorage.getItem('compareProjects') || '[]'
    );

    let updatedProjects: string[];

    if (compareProjects.includes(projectId)) {
      updatedProjects = compareProjects.filter(
        (id: string) => id !== projectId
      );

      setSelected(false);
    } else {
      if (compareProjects.length >= 3) {
        alert(
          'You can compare a maximum of 3 properties at a time.'
        );
        return;
      }

      updatedProjects = [...compareProjects, projectId];

      setSelected(true);
    }

    localStorage.setItem(
      'compareProjects',
      JSON.stringify(updatedProjects)
    );

    window.dispatchEvent(
      new Event('compareUpdated')
    );
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleCompare}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-300 text-gray-700'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={selected ? 'on' : 'off'}
          initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="inline-flex"
        >
          <Scale className="w-4 h-4" />
        </motion.span>
      </AnimatePresence>

      {selected
        ? 'Added To Compare'
        : 'Compare'}
    </motion.button>
  );
}