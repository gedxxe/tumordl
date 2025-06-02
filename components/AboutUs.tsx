import React from 'react';

interface StudentInfo {
  name: string;
  program: string;
  description: string;
  imageUrl?: string; // Optional: for future use with actual images
}

const AboutUs: React.FC = () => {
  const students: StudentInfo[] = [
    {
      name: "Deyndrawan Sutrisno",
      program: "Electrical Engineering Student of 2021",
      description: "A passionate developer focusing on AI applications in healthcare. Contributed to model integration and UI development for this project.",
      imageUrl: "https://placehold.co/150x150/64748b/e2e8f0/png?text=Deyndra" 
    },
    {
      name: "I Gede Bagus Jayendra",
      program: "Electrical Engineering Student of 2022",
      description: "Specializes in data processing and machine learning algorithms. Played a key role in dataset preparation and model optimization.",
      imageUrl: "https://placehold.co/150x150/64748b/e2e8f0/png?text=Gede" 
    },
    {
      name: "Bayu Adi Pambudi",
      program: "Electrical Engineering Student of 2021",
      description: "Focused on user experience and ethical AI. Ensured the application is intuitive and considers the implications of AI in medical diagnostics.",
      imageUrl: "https://placehold.co/150x150/64748b/e2e8f0/png?text=Bayu" 
    },
  ];

  return (
    <section 
      id="about-us-content" // Added ID for scroll targeting
      aria-labelledby="about-us-title" 
      className="w-full max-w-6xl mx-auto"
    >
      <h2 id="about-us-title" className="text-4xl md:text-5xl font-mono font-bold text-center text-slate-100 mb-8 tracking-wider">
        ABOUT US
      </h2>
      <p className="text-center text-slate-300 mb-12 md:mb-16 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
        We are a team from the UNNES Electrical Engineering Department, driven by the goal of creating a positive impact on the world. This project, developed for our Artificial Intelligence course, serves as a practical exploration of AI's potential and aims to highlight its significant benefits within the healthcare domain.
      </p>
      
      <div className="space-y-10 md:space-y-12"> {/* Container for all student entries */}
        {students.map((student, index) => (
          <article 
            key={index} 
            className="flex flex-col md:flex-row items-center md:items-center gap-x-6 lg:gap-x-10 gap-y-6 py-6 md:py-8 border-b border-slate-700/50 last:border-b-0"
            aria-labelledby={`student-name-${index}`}
          >
            {/* Text Content Area (Description & Program) - Appears on the left on md+ */}
            <div className="md:flex-1 text-center md:text-left w-full">
              <p className="text-slate-300 leading-relaxed mb-3 text-sm md:text-base">
                {student.description}
              </p>
              <p className="text-sky-400 text-xs md:text-sm font-medium">{student.program}</p>
            </div>

            {/* Image & Name Area - Appears on the right on md+ */}
            <div className="flex-shrink-0 flex flex-col items-center w-full md:w-44 lg:w-48">
              <div className="w-32 h-32 lg:w-36 lg:h-36 bg-slate-700/50 rounded-full mb-3.5 flex items-center justify-center border-2 border-slate-600 shadow-lg overflow-hidden">
                {student.imageUrl ? (
                  <img 
                    src={student.imageUrl} 
                    alt={student.name} 
                    className="w-full h-full object-cover" // object-cover ensures the image fills the circle
                  />
                ) : (
                  // Fallback Placeholder Icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 lg:w-20 lg:h-20 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <h3 id={`student-name-${index}`} className="text-lg lg:text-xl font-semibold text-slate-100 text-center">{student.name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AboutUs;