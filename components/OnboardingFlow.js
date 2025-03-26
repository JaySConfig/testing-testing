import React, { useState, useEffect } from 'react';
import SectionProgress from './SectionProgress';
import ReviewAnswers from './ReviewAnswers';
import { sections } from './QuestionsData'; 

function OnboardingFlow() {
  // Your existing sections data
 

  // State variables
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);

  // Save progress to localStorage
  const saveProgress = () => {
    const progressData = {
      answers,
      currentSectionIndex,
      currentQuestionIndex,
      isReviewMode
    };
    
    localStorage.setItem('onboardingProgress', JSON.stringify(progressData));
  };

  // Load progress from localStorage
  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem('onboardingProgress');
      
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Restore the state
        setAnswers(progressData.answers || {});
        setCurrentSectionIndex(progressData.currentSectionIndex || 0);
        setCurrentQuestionIndex(progressData.currentQuestionIndex || 0);
        setIsReviewMode(progressData.isReviewMode || false);
        
        return true; // Indicate that progress was successfully loaded
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    
    return false; // Indicate that no progress was loaded
  };

  // Clear progress from localStorage
  const clearProgress = () => {
    localStorage.removeItem('onboardingProgress');
  };

  // Check for existing progress on component mount
  useEffect(() => {
    // Check if progress exists but don't load it yet
    const savedProgress = localStorage.getItem('onboardingProgress');
    if (savedProgress) {
      setHasExistingProgress(true);
    }
  }, []);

  // Function to handle resuming saved progress
  const handleResumeProgress = () => {
    loadProgress();
    setHasExistingProgress(false);
  };

  // Function to handle starting fresh
  const handleStartFresh = () => {
    clearProgress();
    setHasExistingProgress(false);
  };

  // Navigation functions
  const goToNextQuestion = () => {
    // If there are more questions in this section
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } 
    // If we're at the last question but there are more sections
    else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
    
    // Save progress after navigation
    setTimeout(saveProgress, 0);
  };
  
  const goToPreviousQuestion = () => {
    // If we're not at the first question of the section
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } 
    // If we're at the first question but not the first section
    else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      // Go to the last question of the previous section
      setCurrentQuestionIndex(sections[currentSectionIndex - 1].questions.length - 1);
    }
    
    // Save progress after navigation
    setTimeout(saveProgress, 0);
  };

  // Handle submission
// In your OnboardingFlow.js file
const handleSubmit = () => {
  if (!isReviewMode) {
    // If not in review mode, this function was called to enter review mode
    setIsReviewMode(true);
    setTimeout(saveProgress, 0);
    return;
  }
  
  try {
    // Generate a simple ID
    const submissionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Create submission object
    const submission = {
      id: submissionId,
      answers,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem(`submission_${submissionId}`, JSON.stringify(submission));
    
    // Clear progress since we're done
    localStorage.removeItem('onboardingProgress');
    
    // Redirect to results page
    window.location.href = `/results?id=${submissionId}`;
    
  } catch (error) {
    console.error('Error saving submission:', error);
    alert("There was an error saving your answers. Please try again.");
  }
};

  // Handle different answer types with auto-save
  const handleSingleSelect = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
    
    // Save progress after answer is updated
    setTimeout(saveProgress, 0);
  };
  
  const handleMultiSelect = (questionId, value) => {
    // Get current selections for this question (or empty array if none)
    const currentSelections = answers[questionId] || [];
    
    // If already selected, remove it
    if (currentSelections.includes(value)) {
      setAnswers({
        ...answers,
        [questionId]: currentSelections.filter(item => item !== value)
      });
    } 
    // Otherwise add it, if not exceeding max selections
    else if (!currentQuestion.maxSelections || currentSelections.length < currentQuestion.maxSelections) {
      setAnswers({
        ...answers,
        [questionId]: [...currentSelections, value]
      });
    }
    
    // Save progress after answer is updated
    setTimeout(saveProgress, 0);
  };

  const handleTagAdd = () => {
    const tags = answers[currentQuestion.id] || [];
    if (inputValue.trim() && !tags.includes(inputValue.trim()) && 
        tags.length < (currentQuestion.maxSelections || Infinity)) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...tags, inputValue.trim()]
      });
      setInputValue('');
      
      // Save progress after answer is updated
      setTimeout(saveProgress, 0);
    }
  };

  const handleTagRemove = (tag) => {
    const tags = answers[currentQuestion.id] || [];
    setAnswers({
      ...answers,
      [currentQuestion.id]: tags.filter(t => t !== tag)
    });
    
    // Save progress after answer is updated
    setTimeout(saveProgress, 0);
  };

  const handleSuggestionClick = (suggestion) => {
    const tags = answers[currentQuestion.id] || [];
    if (tags.length < (currentQuestion.maxSelections || Infinity) && !tags.includes(suggestion)) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...tags, suggestion]
      });
      
      // Save progress after answer is updated
      setTimeout(saveProgress, 0);
    }
  };

  // Get current section and question
  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  // Render question types with accessibility improvements
const renderSingleSelect = () => {
  return (
    <div className="flex flex-col space-y-3" role="radiogroup" aria-labelledby={`question-${currentQuestion.id}`}>
      <span id={`question-${currentQuestion.id}`} className="sr-only">{currentQuestion.question}</span>
      {currentQuestion.options.map((option, index) => {
        const isSelected = answers[currentQuestion.id] === option.value;
        
        return (
          <button 
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            className={`flex items-center p-4 border rounded-lg text-left transition-colors
              ${isSelected 
                ? 'border-emerald-700 bg-emerald-50' 
                : 'border-gray-200 hover:bg-gray-50'}`}
            onClick={() => handleSingleSelect(currentQuestion.id, option.value)}
          >
            <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded mr-3 text-sm font-medium text-gray-700">
              {String.fromCharCode(65 + index)}
            </span> 
            <span className="text-gray-700">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const renderMultiSelect = () => {
  const selectedValues = answers[currentQuestion.id] || [];
  const canSelectMore = !currentQuestion.maxSelections || selectedValues.length < currentQuestion.maxSelections;
  
  return (
    <div className="space-y-4">
      <p id={`multiselect-help-${currentQuestion.id}`} className="text-sm text-gray-500">
        {selectedValues.length} of {currentQuestion.maxSelections || 'unlimited'} selected
        {currentQuestion.minSelections && ` (minimum ${currentQuestion.minSelections})`}
      </p>
      
      <div 
        className="flex flex-col space-y-3" 
        role="group" 
        aria-labelledby={`question-${currentQuestion.id}`}
        aria-describedby={`multiselect-help-${currentQuestion.id}`}
      >
        <span id={`question-${currentQuestion.id}`} className="sr-only">{currentQuestion.question}</span>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <button 
              key={option.value}
              role="checkbox"
              aria-checked={isSelected}
              className={`flex items-center p-4 border rounded-lg text-left transition-colors
                ${isSelected 
                  ? 'border-emerald-700 bg-emerald-50' 
                  : !canSelectMore && !isSelected
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => handleMultiSelect(currentQuestion.id, option.value)}
              disabled={!canSelectMore && !isSelected}
            >
              <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded mr-3 text-sm font-medium text-gray-700">
                {String.fromCharCode(65 + index)}
              </span> 
              <span className="text-gray-700">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const renderTagInput = () => {
  const tags = answers[currentQuestion.id] || [];
  const inputId = `tag-input-${currentQuestion.id}`;
  const helpId = `tag-help-${currentQuestion.id}`;
  
  return (
    <div className="space-y-4">
      <p id={helpId} className="text-sm text-gray-500">
        {tags.length} of {currentQuestion.maxSelections || 'unlimited'} selected
        {currentQuestion.minSelections && ` (minimum ${currentQuestion.minSelections})`}
      </p>
      
      {/* Selected tags */}
      <div className="mb-4">
      <div className="flex flex-wrap gap-2" role="list" aria-label="Selected tags">
        {tags.map(tag => (
          <div key={tag} className="flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-gray-700" role="listitem">
            <span className="mr-1 text-gray-700">{tag}</span>
            <button 
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      </div>
      
      {/* Input field with suggestions */}
      {tags.length < (currentQuestion.maxSelections || Infinity) && (
        <div className="space-y-2">
          <div className="flex">
            <label htmlFor={inputId} className="sr-only">Add a tag</label>
            <input
              id={inputId}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type an expertise area..."
              className="border border-gray-300 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
              aria-describedby={helpId}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  e.preventDefault();
                  handleTagAdd();
                }
              }}
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="bg-white border border-gray-300 border-l-1 rounded-r-lg px-4 py-2 ml-1 hover:bg-gray-50 text-gray-700"
              aria-label="Add tag"
            >
              Add
            </button>
          </div>
          
          {/* Suggestions */}
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Tag suggestions">
              {currentQuestion.suggestions
                .filter(suggestion => !tags.includes(suggestion))
                .slice(0, 8)
                .map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700"
                    disabled={tags.length >= (currentQuestion.maxSelections || Infinity)}
                    aria-label={`Add suggestion: ${suggestion}`}
                    role="listitem"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main render function that calls the appropriate render method
const renderQuestion = () => {
  if (!currentQuestion) return null;
  
  switch (currentQuestion.type) {
    case 'singleSelect':
      return renderSingleSelect();
    case 'multiSelect':
      return renderMultiSelect();
    case 'tagInput':
      return renderTagInput();
    default:
      return <p className="text-gray-700">Unknown question type: {currentQuestion.type}</p>;
  }
};

// Show resume progress dialog if applicable
if (hasExistingProgress) {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Resume Your Progress?</h2>
        <p className="mb-6 text-gray-700">We found your previously saved answers. Would you like to continue where you left off?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartFresh}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
          >
            Start Fresh
          </button>
          <button
            onClick={handleResumeProgress}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Resume Progress
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component render
return (
  <div className="min-h-screen bg-white p-4">
    {/* Fixed top section */}
    <div className="max-w-md mx-auto">
      {/* Progress indicator always at the top */}
      <SectionProgress 
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        isReviewMode={isReviewMode}
      />
      
      {isReviewMode ? (
        <ReviewAnswers
          sections={sections}
          answers={answers}
          onSubmit={handleSubmit}
          onEdit={() => setIsReviewMode(false)}
        />
      ) : (
        <>
          {/* Question header - fixed at top */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">{currentSection.title}</p>
            <h2 className="text-xl font-medium mb-1 text-gray-700">
              {currentQuestionIndex + 1}→ {currentQuestion.question}
            </h2>
            <p className="text-sm text-gray-500">{currentSection.description}</p>
          </div>
          
          {/* Question content - can expand downward */}
          <div>
            {renderQuestion()}
          </div>
          
          {/* Navigation - fixed distance from the question header */}
          <div className="mt-8 flex justify-end">
            {(currentQuestionIndex > 0 || currentSectionIndex > 0) && (
              <button
                onClick={goToPreviousQuestion}
                className="px-4 py-2 border mr-2 border-gray-700 rounded-md text-gray-900 hover:bg-gray-100"
              >
                Back
              </button>
            )}
          
            <button
              onClick={
                currentSectionIndex === sections.length - 1 && 
                currentQuestionIndex === currentSection.questions.length - 1
                  ? () => setIsReviewMode(true)
                  : goToNextQuestion
              }
              className={
                currentSectionIndex === sections.length - 1 && 
                currentQuestionIndex === currentSection.questions.length - 1
                  ? "px-4 py-2 bg-emerald-600 text-white border border-emerald-700 rounded-md hover:bg-emerald-700"
                  : "px-4 py-2 bg-white text-gray-700 border border-emerald-700 rounded-md hover:bg-emerald-100"
              }
            >
              {currentSectionIndex === sections.length - 1 && 
              currentQuestionIndex === currentSection.questions.length - 1
                ? "Review Answers"
                : "Next"
              }
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
            }

//   // Render question types with accessibility improvements
//   const renderSingleSelect = () => {
//     return (
//       <div className="flex flex-col space-y-3" role="radiogroup" aria-labelledby={`question-${currentQuestion.id}`}>
//         <span id={`question-${currentQuestion.id}`} className="sr-only">{currentQuestion.question}</span>
//         {currentQuestion.options.map((option, index) => {
//           const isSelected = answers[currentQuestion.id] === option.value;
          
//           return (
//             <button 
//               key={option.value}
//               role="radio"
//               aria-checked={isSelected}
//               className={`flex items-center p-4 border rounded-lg text-left transition-colors
//                 ${isSelected 
//                   ? 'border-emerald-700 bg-emerald-50' 
//                   : 'border-gray-200 hover:bg-gray-50'}`}
//               onClick={() => handleSingleSelect(currentQuestion.id, option.value)}
//             >
//               <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded mr-3 text-sm font-medium">
//                 {String.fromCharCode(65 + index)}
//               </span> 
//               <span className='text-gray-700'>
//               {option.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderMultiSelect = () => {
//     const selectedValues = answers[currentQuestion.id] || [];
//     const canSelectMore = !currentQuestion.maxSelections || selectedValues.length < currentQuestion.maxSelections;
    
//     return (
//       <div className="space-y-4">
//         <p id={`multiselect-help-${currentQuestion.id}`} className="text-sm text-gray-500">
//           {selectedValues.length} of {currentQuestion.maxSelections || 'unlimited'} selected
//           {currentQuestion.minSelections && ` (minimum ${currentQuestion.minSelections})`}
//         </p>
        
//         <div 
//           className="flex flex-col space-y-3" 
//           role="group" 
//           aria-labelledby={`question-${currentQuestion.id}`}
//           aria-describedby={`multiselect-help-${currentQuestion.id}`}
//         >
//           <span id={`question-${currentQuestion.id}`} className="sr-only">{currentQuestion.question}</span>
//           {currentQuestion.options.map((option, index) => {
//             const isSelected = selectedValues.includes(option.value);
            
//             return (
//               <button 
//                 key={option.value}
//                 role="checkbox"
//                 aria-checked={isSelected}
//                 className={`flex items-center p-4 border rounded-lg text-left transition-colors
//                   ${isSelected 
//                     ? 'border-emerald-700 bg-emerald-50' 
//                     : !canSelectMore && !isSelected
//                       ? 'border-gray-200 opacity-50 cursor-not-allowed'
//                       : 'border-gray-200 hover:bg-gray-50'}`}
//                 onClick={() => handleMultiSelect(currentQuestion.id, option.value)}
//                 disabled={!canSelectMore && !isSelected}
//               >
//                 <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded mr-3 text-sm font-medium text-gray-700">
//                   {String.fromCharCode(65 + index)}
//                 </span> 
//                 <span className='text-gray-700'>
//               {option.label}
//               </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   const renderTagInput = () => {
//     const tags = answers[currentQuestion.id] || [];
//     const inputId = `tag-input-${currentQuestion.id}`;
//     const helpId = `tag-help-${currentQuestion.id}`;
    
//     return (
//       <div className="space-y-4">
//         <p id={helpId} className="text-sm text-gray-500">
//           {tags.length} of {currentQuestion.maxSelections || 'unlimited'} selected
//           {currentQuestion.minSelections && ` (minimum ${currentQuestion.minSelections})`}
//         </p>
        
//         {/* Selected tags */}
//         <div className="mb-4">
//         <div className="flex flex-wrap gap-2" role="list" aria-label="Selected tags">
//           {tags.map(tag => (
//             <div key={tag} className="flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1" role="listitem">
//               <span className="mr-1">{tag}</span>
//               <button 
//                 type="button"
//                 onClick={() => handleTagRemove(tag)}
//                 className="text-gray-500 hover:text-gray-700"
//                 aria-label={`Remove ${tag}`}
//               >
//                 ×
//               </button>
//             </div>
//           ))}
//         </div>
//         </div>
        
//         {/* Input field with suggestions */}
//         {tags.length < (currentQuestion.maxSelections || Infinity) && (
//           <div className="space-y-2">
//             <div className="flex">
//               <label htmlFor={inputId} className="sr-only">Add a tag</label>
//               <input
//                 id={inputId}
//                 type="text"
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 placeholder="Type an expertise area..."
//                 className="border border-gray-300 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                 aria-describedby={helpId}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && inputValue.trim()) {
//                     e.preventDefault();
//                     handleTagAdd();
//                   }
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={handleTagAdd}
//                 className="bg-white border border-gray-300 border-l-1 rounded-r-lg px-4 py-2 ml-1 hover:bg-gray-50"
//                 aria-label="Add tag"
//               >
//                 Add
//               </button>
//             </div>
            
//             {/* Suggestions */}
//             <div className="mt-2">
//               <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
//               <div className="flex flex-wrap gap-2" role="list" aria-label="Tag suggestions">
//                 {currentQuestion.suggestions
//                   .filter(suggestion => !tags.includes(suggestion))
//                   .slice(0, 8)
//                   .map(suggestion => (
//                     <button
//                       key={suggestion}
//                       type="button"
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       className="bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-sm"
//                       disabled={tags.length >= (currentQuestion.maxSelections || Infinity)}
//                       aria-label={`Add suggestion: ${suggestion}`}
//                       role="listitem"
//                     ><span></span>
//                       {suggestion}
//                     </button>
//                   ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   // Main render function that calls the appropriate render method
//   const renderQuestion = () => {
//     if (!currentQuestion) return null;
    
//     switch (currentQuestion.type) {
//       case 'singleSelect':
//         return renderSingleSelect();
//       case 'multiSelect':
//         return renderMultiSelect();
//       case 'tagInput':
//         return renderTagInput();
//       default:
//         return <p>Unknown question type: {currentQuestion.type}</p>;
//     }
//   };

//   // Show resume progress dialog if applicable
//   if (hasExistingProgress) {
//     return (
//       <div className="min-h-screen bg-white p-4">
//         <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
//           <h2 className="text-xl font-bold mb-4">Resume Your Progress?</h2>
//           <p className="mb-6">We found your previously saved answers. Would you like to continue where you left off?</p>
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={handleStartFresh}
//               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               Start Fresh
//             </button>
//             <button
//               onClick={handleResumeProgress}
//               className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
//             >
//               Resume Progress
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main component render
//   return (
//     <div className="min-h-screen bg-white p-4">
//       {/* Fixed top section */}
//       <div className="max-w-md mx-auto">
//         {/* Progress indicator always at the top */}
//         <SectionProgress 
//           sections={sections}
//           currentSectionIndex={currentSectionIndex}
//           currentQuestionIndex={currentQuestionIndex}
//           isReviewMode={isReviewMode}
//         />
        
//         {isReviewMode ? (
//           <ReviewAnswers
//             sections={sections}
//             answers={answers}
//             onSubmit={handleSubmit}
//             onEdit={() => setIsReviewMode(false)}
//           />
//         ) : (
//           <>
//             {/* Question header - fixed at top */}
//             <div className="mb-8">
//               <p className="text-sm text-gray-500 mb-1">{currentSection.title}</p>
//               <h2 className="text-xl font-medium mb-1 text-gray-700">
//                 {currentQuestionIndex + 1}→ {currentQuestion.question}
//               </h2>
//               <p className="text-sm text-gray-500">{currentSection.description}</p>
//             </div>
            
//             {/* Question content - can expand downward */}
//             <div>
//               {renderQuestion()}
//             </div>
            
//             {/* Navigation - fixed distance from the question header */}
//             <div className="mt-8 flex justify-end">
//               {(currentQuestionIndex > 0 || currentSectionIndex > 0) && (
//                 <button
//                   onClick={goToPreviousQuestion}
//                   className="px-4 py-2 border mr-2 border-gray-700 rounded-md text-gray-900 hover:bg-gray-100"
//                 >
//                   Back
//                 </button>
//               )}
            
//               <button
//                 onClick={
//                   currentSectionIndex === sections.length - 1 && 
//                   currentQuestionIndex === currentSection.questions.length - 1
//                     ? () => setIsReviewMode(true)
//                     : goToNextQuestion
//                 }
//                 className={
//                   currentSectionIndex === sections.length - 1 && 
//                   currentQuestionIndex === currentSection.questions.length - 1
//                     ? "px-4 py-2 bg-emerald-600 text-white border border-emerald-700 rounded-md hover:bg-emerald-700"
//                     : "px-4 py-2 bg-white text-black border border-emerald-700 rounded-md hover:bg-emerald-100"
//                 }
//               >
//                 {currentSectionIndex === sections.length - 1 && 
//                 currentQuestionIndex === currentSection.questions.length - 1
//                   ? "Review Answers"
//                   : "Next"
//                 }
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

export default OnboardingFlow;