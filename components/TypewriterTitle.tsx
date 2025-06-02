import React from 'react';
import useTypewriter from '../hooks/useTypewriter';
import { APP_TITLE } from '../constants';

const TypewriterTitle: React.FC = () => {
  const typedTitle = useTypewriter(APP_TITLE, 75);

  return (
    <h1 className="text-4xl md:text-5xl font-mono font-bold text-center text-slate-100 mb-10 tracking-wider">
      {typedTitle}
      <span className="caret-blink">_</span>
    </h1>
  );
};

export default TypewriterTitle;