function ReviewAnswers({ sections, answers, onSubmit, onEdit }) {
  // Helper function to render different answer types
  const renderAnswer = (question, answer) => {
    if (!answer) return <p className="text-gray-500 italic">No answer provided</p>;
    
    switch (question.type) {
      case 'singleSelect': {
        const selectedOption = question.options.find(opt => opt.value === answer);
        return <p className="text-gray-700">{selectedOption?.label || answer}</p>;
      }
      case 'multiSelect': {
        return (
          <ul className="list-disc pl-5">
            {answer.map(value => {
              const option = question.options.find(opt => opt.value === value);
              return <li key={value} className="text-gray-700">{option?.label || value}</li>;
            })}
          </ul>
        );
      }
      case 'tagInput': {
        return (
          <div className="flex flex-wrap gap-2">
            {answer.map(tag => (
              <span key={tag} className="bg-emerald-100 rounded-full px-3 py-1 text-sm text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        );
      }
      default:
        return <p className="text-gray-700">{JSON.stringify(answer)}</p>;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-1 text-gray-700">
          Review Your Answers
        </h2>
        <p className="text-sm text-gray-500">Please check your answers before submitting.</p>
      </div>
      
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-3 text-gray-800">{section.title}</h3>
            {section.questions.map(question => (
              <div key={question.id} className="mb-4">
                <p className="text-sm font-medium mb-2 text-gray-700">{question.question}</p>
                {renderAnswer(question, answers[question.id])}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={onEdit}
          className="px-4 py-2 border mr-2 border-gray-700 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Edit Answers
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-emerald-600 text-white border border-emerald-700 rounded-md hover:bg-emerald-700"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}

export default ReviewAnswers;