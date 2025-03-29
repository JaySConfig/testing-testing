"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ResultsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [submission, setSubmission] = useState(null);
  // Split strategy into two parts
  const [foundationStrategy, setFoundationStrategy] = useState(null);
  const [calendarStrategy, setCalendarStrategy] = useState(null);
  // Separate loading states for each part
  const [foundationLoading, setFoundationLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Post generation states
  const [generatingPostId, setGeneratingPostId] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    try {
      // Get submission from localStorage
      const savedSubmission = localStorage.getItem(`submission_${id}`);
      if (!savedSubmission) {
        setError('Submission not found. It may have been deleted or expired.');
        return;
      }
      const parsedSubmission = JSON.parse(savedSubmission);
      setSubmission(parsedSubmission);
      // Generate strategy foundation first
      generateFoundation(parsedSubmission);
    } catch (err) {
      console.error('Error loading submission:', err);
      setError('Failed to load your submission. Please try again.');
    }
  }, [id]);
  
  const generateFoundation = async (submissionData) => {
    setFoundationLoading(true);
    try {
      const response = await fetch('/api/generate-foundation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      if (!response.ok) {
        throw new Error('Failed to generate strategy foundation');
      }
      const data = await response.json();
      setFoundationStrategy(data.foundation);
      
      // Once foundation is complete, generate calendar
      generateCalendar(submissionData, data.foundation);
    } catch (err) {
      console.error('Error generating foundation:', err);
      setError('Failed to generate your LinkedIn strategy foundation. Please try again.');
    } finally {
      setFoundationLoading(false);
    }
  };
  
  const generateCalendar = async (submissionData, foundation) => {
    setCalendarLoading(true);
    try {
      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionData,
          foundation
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate content calendar');
      }
      const data = await response.json();
      setCalendarStrategy(data.calendar);
    } catch (err) {
      console.error('Error generating calendar:', err);
      setError('Failed to generate your content calendar. Please try again.');
    } finally {
      setCalendarLoading(false);
    }
  };
  
  const generatePost = async (pillar, topic, approach, contentType, index) => {
    try {
      setGeneratingPostId(index);

      // get users preferences from submission state
      // Simply get these values from your existing submission data
      const userVoice = submission.answers.userVoice;
      const uniquePerspective = submission.answers.uniquePerspective;
      
      
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pillar, 
          topic, 
          approach, 
          contentType,
          userVoice,
          uniquePerspective
         }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate post');
      }
      
      const data = await response.json();
      setGeneratedPost(data.post);
      setShowPostModal(true);
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Failed to generate post. Please try again.');
    } finally {
      setGeneratingPostId(null);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Post copied to clipboard!");
      })
      .catch((err) => {
        console.error('Error copying text: ', err);
        alert("Failed to copy post");
      });
  };

  // Add this function to your component
  const extractTableData = (markdownContent) => {
    try {
      // Look for content calendar section (assuming it starts with a heading)
      const calendarSection = markdownContent.split('## FOUR-WEEK CONTENT CALENDAR')[1];
      if (!calendarSection) return null;
      
      // Extract table rows (each row starts with '|')
      const tableRows = calendarSection.split('\n')
        .filter(line => line.trim().startsWith('|'))
        .map(line => line.split('|')
          .filter(cell => cell.trim()) // Remove empty cells
          .map(cell => cell.trim()) // Trim whitespace
        );
      
      // First row is the header
      const headers = tableRows[0];
      
      // Rest are data rows
      const rows = tableRows.slice(1).map(row => ({
        weekDay: row[0] || '',
        pillar: row[1] || '',
        topic: row[2] || '',
        approach: row[3] || '',
        contentType: row[4] || ''
      }));
      
      return { headers, rows };
    } catch (error) {
      console.error("Error parsing calendar table:", error);
      return null;
    }
  };

  // Add this function right after your existing extractTableData function
  const extractContentSections = (markdownContent) => {
    try {
      // Split by the calendar heading
      const parts = markdownContent.split('## FOUR-WEEK CONTENT CALENDAR');
      
      // Everything before the calendar
      const beforeCalendar = parts[0];
      
      // Extract table and everything after it
      const calendarSection = parts[1];
      if (!calendarSection) return { beforeCalendar: markdownContent, tableData: null, afterCalendar: '' };
      
      // Find where the table ends
      const calendarLines = calendarSection.split('\n');
      const tableLines = calendarLines
        .map((line, index) => ({ line, index }))
        .filter(item => item.line.trim().startsWith('|'));
      
      const lastTableLineIndex = tableLines.length > 0 ? 
        tableLines[tableLines.length - 1].index : 0;
      
      // Find the actual index in the original calendarLines array
      const afterTableStartIndex = lastTableLineIndex + 2; // +2 to skip the empty line
      
      // Everything after the table
      const afterCalendar = calendarLines.slice(afterTableStartIndex).join('\n');
      
      // The table data
      const tableData = extractTableData(markdownContent);
      
      return {
        beforeCalendar,
        tableData,
        afterCalendar: '## FOUR-WEEK CONTENT CALENDAR' + afterCalendar // Keep the heading in the after section
      };
    } catch (error) {
      console.error("Error parsing content sections:", error);
      return {
        beforeCalendar: markdownContent,
        tableData: null,
        afterCalendar: ''
      };
    }
  };
  
  // Add retry functionality for both parts
  const retryFoundation = () => {
    if (!submission) return;
    setError(null);
    generateFoundation(submission);
  };
  
  const retryCalendar = () => {
    if (!submission || !foundationStrategy) return;
    setError(null);
    generateCalendar(submission, foundationStrategy);
  };

  
  if (!id) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
          
          {/* Add retry buttons to recover from errors */}
          <div className="mt-4 flex gap-4">
            <button 
              onClick={retryFoundation}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md"
            >
              Retry Strategy
            </button>
            <a href="/linkedin-strategy" className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md">
              Start Over
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Custom component wrapper for markdown content
  const MarkdownContent = ({ content }) => (
    <div className="prose prose-lg space-y-6 prose-emerald max-w-none text-gray-800">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({node, ...props}) => (
            <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="my-6 leading-7" {...props} />
          ),
          strong: ({node, ...props}) => (
            <strong className="font-bold text-gray-900 block mt-6" {...props} />
          ),
          table: ({node, ...props}) => (
            <div className="my-10 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody className="divide-y divide-gray-200" {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="hover:bg-gray-50" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="px-6 py-4 border border-gray-200 text-sm" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium bg-gray-100" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Your LinkedIn Strategy</h1>
        
        {/* Strategic Foundation Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Strategic Foundation</h2>
          
          {foundationLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p>Developing your strategic foundation...</p>
              <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
            </div>
          ) : foundationStrategy ? (
            <MarkdownContent content={foundationStrategy} />
          ) : submission ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <p>Preparing your strategy foundation...</p>
            </div>
          ) : (
            <p>Loading your submission data...</p>
          )}
          
          {/* Retry button for foundation */}
          {!foundationLoading && foundationStrategy && (
            <button 
              onClick={retryFoundation}
              className="mt-4 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
            >
              Regenerate Foundation
            </button>
          )}
        </div>
        
        {/* Content Calendar Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Content Calendar</h2>
              {calendarLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                  <p>Creating your content calendar...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 20-40 seconds</p>
                </div>
              ) : calendarStrategy ? (
                <>
                  {/* Content before the table */}
                  <MarkdownContent content={extractContentSections(calendarStrategy).beforeCalendar} />
                  
                  {/* Interactive table */}
                  <div className="mt-8 mb-8">
                    <h3 className="text-xl font-semibold mb-4">Four-Week Content Calendar</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Week - Day</th>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Pillar</th>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Topic</th>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Approach</th>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Content Type</th>
                            <th className="px-6 py-4 border border-gray-200 text-left text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {extractContentSections(calendarStrategy).tableData?.rows.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 border border-gray-200 text-sm">{row.weekDay}</td>
                              <td className="px-6 py-4 border border-gray-200 text-sm">{row.pillar}</td>
                              <td className="px-6 py-4 border border-gray-200 text-sm">{row.topic}</td>
                              <td className="px-6 py-4 border border-gray-200 text-sm">{row.approach}</td>
                              <td className="px-6 py-4 border border-gray-200 text-sm">{row.contentType}</td>
                              <td className="px-6 py-4 border border-gray-200 text-sm">
                                <button 
                                  onClick={() => generatePost(row.pillar, row.topic, row.approach, row.contentType, index)}
                                  className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
                                  disabled={generatingPostId === index}
                                >
                                  {generatingPostId === index ? 'Generating...' : 'Generate Post'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Content after the table */}
                  <MarkdownContent content={extractContentSections(calendarStrategy).afterCalendar} />
                </>
              ) : (
                // Keep your existing loading state
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                  <p className="text-gray-500 italic">
                    Waiting for strategic foundation to complete...
                  </p>
                </div>
              )}
          
          {/* Retry button for calendar */}
          {!calendarLoading && foundationStrategy && calendarStrategy && (
            <button
              onClick={retryCalendar}
              className="mt-4 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
            >
              Regenerate Calendar
            </button>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-12 flex flex-wrap gap-4">
          <a href="/linkedin-strategy" className="px-4 py-2 bg-emerald-600 text-white rounded-md inline-block hover:bg-emerald-700">
            Create New Strategy
          </a>
        </div>
        
        {/* Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">Generated Post</h2>
              <div className="prose prose-sm mt-4 mb-4">
              <div className="prose prose-sm whitespace-pre-wrap"> {/* Added whitespace-pre-wrap */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedPost}
              </ReactMarkdown>
            </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Close
                </button>
                <button 
                  onClick={() => copyToClipboard(generatedPost)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Results() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}