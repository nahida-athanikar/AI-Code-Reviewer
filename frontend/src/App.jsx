import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import "highlight.js/styles/github-dark.css"
import Editor from "react-simple-code-editor"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CopyButton from "./CopyButton";

import prism from 'prismjs'
import axios from 'axios'
import './App.css'
import { saveAs } from "file-saver";



function App() {
  const [code, setCode] = useState(``);
  const [review, setReview] = useState(null); // stores { language, issues, suggestions }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setIsLoading(true);
    setError(null);
    setReview(null);

    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
      setReview(response.data.review || response.data); // backend returns { language, issues, suggestions }
    } catch (err) {
      setError("⚠️ Unable to fetch review at the moment. Please try again later.");
    }

    setIsLoading(false);
  }

  return (
    <main className="app-container">
      <div className="left">
       <h2 className="panel-title">🚀 AI Code Reviewer</h2>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
          padding={10}
          placeholder="Paste your code here..."
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 16,
            border: "1px solid #ddd",
            borderRadius: "5px",
            minHeight: "80vh",
            width: "100%",
            overflow: "auto",
            background: "#1a1a1a",
            color: "#eee",
            
          }}
        />
        
        <button className="review-btn" onClick={reviewCode} disabled={isLoading}>
          {isLoading ? "⏳ Reviewing..." : "🔍 Review"}
        </button>
      </div>

      <div className="right">
          <h2 className="panel-title">📋 Review Result</h2>
          <div className="markdown-content">
            {isLoading && <p>Reviewing your code...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!review && !isLoading && !error && (
              <div className="empty-state">⚡ Run a review to see results here</div>
            )}
                    
            {/* Render AI response as plain markdown */}
            {review && !error && (
            <div className="review-output">
            <ReactMarkdown
              children={review}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
              h1: (props) => <h1 className="md-heading" {...props} />,
              h2: (props) => <h2 className="md-heading" {...props} />,
              h3: (props) => <h3 className="md-heading" {...props} />,
              p: (props) => <p className="md-paragraph" {...props} />,
              li: (props) => <li className="md-list" {...props} />,
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code className="md-code inline" {...props}>{children}</code>
                ) : (
                  <pre className="md-code block" {...props}>{children}
                 <CopyButton text={Array.isArray(children) ? children.join('') : children} />
                  </pre>
                ),
              pre: (props) => <pre className="md-pre" {...props} />,
              }}

              
            />
             
            {/* 📥 Download Button */}
            <button 
              className="download-btn" 
              onClick={() => downloadAsMarkdown(review)}
            >
              📥 Download as README.md
            </button>
          </div>
          )}
      </div>
</div>

    </main>
  );
}

function downloadAsMarkdown(content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, "README.md");
}


export default App;
