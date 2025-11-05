import React, { useState, useRef } from 'react';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaSearch, FaTimes, FaUndo, FaRedo, FaFilePdf, FaFileWord, FaCopy } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

// Simple DOCX generation function
const generateDocx = (text) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Document</title>
        </head>
        <body>${text.replace(/\n/g, '<br>')}</body>
        </html>
    `;
    return new Blob([html], { type: 'application/msword' });
};

export default function Textarea(prop) {
    const [text, setText] = useState("");
    const [alignment, setAlignment] = useState('left');
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [replaceTerm, setReplaceTerm] = useState('');
    const [history, setHistory] = useState([""]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const textareaRef = useRef(null);
    const searchInputRef = useRef(null);

    const clearText = () => {
        // No need to clear placeholder text anymore
    }

    const upperCase = () => {
        let newtext = text.toUpperCase();
        setText(newtext);
        prop.alert('success', 'Text converted to Upper Case');
    }

    const lowerCase = () => {
        let newtext = text.toLowerCase();
        setText(newtext);
        prop.alert('success', 'Text converted to Lower Case');
    }

    const addText = (event) => {
        const newText = event.target.value;
        setText(newText);
        
        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newText);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
    
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    
    const handleUndo = () => {
        if (canUndo) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setText(history[newIndex]);
        }
    };
    
    const handleRedo = () => {
        if (canRedo) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setText(history[newIndex]);
        }
    };


    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            // Focus the search input when opening the search panel
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 0);
        } else {
            // Clear search when closing
            setSearchTerm('');
            setReplaceTerm('');
        }
    }

    const handleFind = (e) => {
        setSearchTerm(e.target.value);
    }

    const handleReplace = (e) => {
        setReplaceTerm(e.target.value);
    }

    const replaceAll = () => {
        if (!searchTerm) return;
        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
        const newText = text.replace(regex, replaceTerm);
        setText(newText);
        prop.alert('success', 'Replacement completed');
    }

    // Helper function to escape special regex characters
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const getSummary = (text) => {
        if (!text.trim()) return 'Enter some text to see the summary here.';
        
        // Split into sentences (more robust sentence splitting)
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        if (sentences.length <= 2) {
            return 'Text is too short to summarize meaningfully';
        }

        // Calculate word frequencies (more aggressive filtering)
        const words = text.toLowerCase()
            .replace(/[^\w\s]|_/g, '')  // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 4)  // Only consider longer words
            .filter(word => !['that', 'this', 'with', 'from', 'have', 'they', 'would', 'could'].includes(word));

        if (words.length < 5) {
            return 'Not enough meaningful content to summarize';
        }

        const wordFrequencies = {};
        words.forEach(word => {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        });

        // Score sentences based on word frequencies and position
        const sentenceScores = sentences.map((sentence, index) => {
            const sentenceWords = sentence.toLowerCase()
                .replace(/[^\w\s]|_/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3);
            
            let score = 0;
            sentenceWords.forEach(word => {
                if (word in wordFrequencies) {
                    // Give more weight to words that appear in the middle of the text
                    const positionWeight = 1 + (0.5 * Math.abs((sentences.length/2 - index) / sentences.length));
                    score += (wordFrequencies[word] * positionWeight);
                }
            });
            
            // Give bonus to first and last sentences
            if (index === 0 || index === sentences.length - 1) {
                score *= 1.5;
            }
            
            return { 
                sentence: sentence.trim(), 
                score,
                originalIndex: index
            };
        });

        // Calculate how many sentences to include (20-40% of original)
        const minSentences = Math.min(3, Math.ceil(sentences.length * 0.2));
        const maxSentences = Math.max(minSentences, Math.ceil(sentences.length * 0.4));
        const targetLength = Math.min(maxSentences, Math.max(minSentences, Math.ceil(sentences.length * 0.3)));
        
        // Get top sentences while maintaining order
        const summarySentences = sentenceScores
            .sort((a, b) => b.score - a.score)
            .slice(0, targetLength)
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map(item => item.sentence);

        // Join with proper spacing and handle edge cases
        let summary = summarySentences.join(' ').replace(/\s+/g, ' ').trim();
        
        // Ensure the summary is significantly shorter than original
        if (summary.length > text.length * 0.7) {
            // If still too long, take first few sentences
            summary = summarySentences.slice(0, Math.max(2, Math.ceil(summarySentences.length * 0.7)))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        return summary || 'Unable to generate summary';
    }

    // Function to highlight text
    const getHighlightedText = (text, highlight) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() ? 
            <mark key={i} style={{backgroundColor: '#ffeb3b88', color: 'transparent', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> : 
            part
        );
    }

    const handleAlignment = (align) => {
        setAlignment(align);
    }

    const downloadAsPDF = () => {
        const element = document.createElement('div');
        element.style.textAlign = 'left';
        element.style.padding = '20px';
        element.innerHTML = text.replace(/\n/g, '<br>');
        
        const opt = {
            margin: 10,
            filename: 'document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
        prop.alert('success', 'PDF downloaded successfully');
    };

    const downloadAsDOCX = () => {
        const blob = generateDocx(text);
        saveAs(blob, 'document.doc');
        prop.alert('success', 'Word document downloaded successfully');
    };

    const addBulletPoints = () => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);
        
        if (selectedText) {
            // Add bullet points to each line of selected text
            const bulletedText = selectedText
                .split('\n')
                .map(line => line.trim() ? '• ' + line : '')
                .join('\n');
            
            const newText = text.substring(0, start) + bulletedText + text.substring(end);
            setText(newText);
            prop.alert('success', 'Bullet points added');
        } else {
            // If no text is selected, add a bullet at cursor position
            const before = text.substring(0, start);
            const after = text.substring(start);
            setText(before + '• ' + after);
            
            // Move cursor after the bullet point
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
        }
    }
    // const changeMode = () => {
    //     if (color.color === 'black') {
    //         setColor({
    //             color: 'white',
    //             backgroundColor: 'black'
    //         })
    //         setMode("Light Mode");
    //     }
    //     else {
    //         setColor({
    //             color: 'black',
    //             backgroundColor: 'white'
    //         })
    //         setMode("Dark Mode");
    //     }
    // }
    return (
        <div className='container' style={{marginTop:'60px'}}>
            <div className="form-group">
                <h1>Enter Text</h1>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="btn-group" role="group">
                        <button 
                            className={`btn btn-${alignment === 'left' ? 'primary' : 'secondary'} btn-sm`}
                            onClick={() => handleAlignment('left')}
                            title="Align Left"
                        >
                            <FaAlignLeft />
                        </button>
                        <button 
                            className={`btn btn-${alignment === 'center' ? 'primary' : 'secondary'} btn-sm`}
                            onClick={() => handleAlignment('center')}
                            title="Center"
                        >
                            <FaAlignCenter />
                        </button>
                        <button 
                            className={`btn btn-${alignment === 'right' ? 'primary' : 'secondary'} btn-sm`}
                            onClick={() => handleAlignment('right')}
                            title="Align Right"
                        >
                            <FaAlignRight />
                        </button>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={addBulletPoints}
                            title="Add Bullet Points"
                        >
                            <FaListUl />
                        </button>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                navigator.clipboard.writeText(text);
                                prop.alert('success', 'Text copied to clipboard');
                            }}
                            title="Copy to clipboard"
                        >
                            <FaCopy />
                        </button>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                        <div className="btn-group" role="group">
                            <button 
                                className="btn btn-secondary btn-sm"
                                onClick={handleUndo}
                                disabled={!canUndo}
                                title="Undo"
                            >
                                <FaUndo />
                            </button>
                            <button 
                                className="btn btn-secondary btn-sm"
                                onClick={handleRedo}
                                disabled={!canRedo}
                                title="Redo"
                            >
                                <FaRedo />
                            </button>
                        </div>
                        <button 
                            className={`btn btn-sm ${showSearch ? 'btn-primary' : 'btn-secondary'} d-flex align-items-center`}
                            onClick={toggleSearch}
                            title="Find and Replace"
                        >
                            <FaSearch className="me-1" />
                            <span>Search</span>
                            {showSearch && <FaTimes className="ms-1" />}
                        </button>
                    </div>
                </div>
                {showSearch && (
                    <div className="d-flex gap-2 mb-2">
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Find"
                            value={searchTerm}
                            onChange={handleFind}
                        />
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Replace"
                            value={replaceTerm}
                            onChange={handleReplace}
                        />
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={replaceAll}
                            disabled={!searchTerm}
                        >
                            Replace All
                        </button>
                    </div>
                )}
                <div style={{ position: 'relative' }}>
                    <textarea 
                        ref={textareaRef}
                        className="form-control" 
                        id="my-box" 
                        rows="8" 
                        value={text} 
                        onChange={addText} 
                        onFocus={clearText}
                        placeholder="Enter your text here..."
                        style={{
                            backgroundColor: prop.mode === 'light' ? '#f0f0f0' : '#333',
                            color: prop.mode === 'light' ? 'black' : 'white',
                            textAlign: alignment,
                            minHeight: '200px',
                            resize: 'vertical',
                            whiteSpace: 'pre-wrap',
                            overflowY: 'auto',
                            padding: '1.5rem',
                            margin: '1rem 0',
                            border: '1px solid #ced4da',
                            borderRadius: '0.5rem',
                            caretColor: prop.mode === 'light' ? '#212529' : '#fff'
                        }}
                    ></textarea>
                    {searchTerm && text && (
                        <div 
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '1.5rem',
                                right: '1.5rem',
                                bottom: '1.5rem',
                                pointerEvents: 'none',
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap',
                                color: 'transparent',
                                textAlign: alignment
                            }}
                        >
                            {getHighlightedText(text, searchTerm)}
                        </div>
                    )}
                </div>
                <div className="mt-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={upperCase}>UPPERCASE</button>
                        <button className="btn btn-success" onClick={lowerCase}>lowercase</button>
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-danger"
                            onClick={downloadAsPDF}
                            title="Download as PDF"
                        >
                            <FaFilePdf className="me-1" />
                            <span>PDF</span>
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={downloadAsDOCX}
                            title="Download as DOC"
                        >
                            <FaFileWord className="me-1" />
                            <span>DOC</span>
                        </button>
                    </div>
                </div>
            </div>
            <h1>Text Summary</h1>
            <p>Words: {text.split(/\s+/).filter((element)=>{return element.length!==0}).length}</p>
            <p>Characters: {text.length}</p>
            <h1>Summarized</h1>
            <p>{getSummary(text)}</p>
        </div>
    )
}
