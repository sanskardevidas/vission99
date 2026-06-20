import { useEffect, useState } from 'react';
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
    <button
      onClick={handleCompare}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-300 text-gray-700'
      }`}
    >
      <Scale className="w-4 h-4" />

      {selected
        ? 'Added To Compare'
        : 'Compare'}
    </button>
  );
}