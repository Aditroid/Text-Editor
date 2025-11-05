import './App.css';
import About from './components/About';
import Alert from './components/Alert';
import Navbar from './components/Navbar';
import Textarea from './components/Textarea';
import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
function App() {
  const [mode, setMode] = useState('light')
  const [alert, setAlert] = useState(null)
    const showAlert = (type, message) => {
    setAlert({
      type: type,
      message: message
    });
    setTimeout(() => {
      setAlert(null);
    }, 2000);
  }
  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark')
      document.body.style.backgroundColor = '#333'
      document.body.style.color = 'white'
      showAlert('warning', 'Dark Mode has been Enabled')
    } else {
      setMode('light')
      document.body.style.backgroundColor = '#f0f0f0'
      document.body.style.color = 'black'
      showAlert('danger', 'Light Mode has been Enabled')

    }
  }
  const handleExportPDF = () => {
    // This function will be called from the Navbar
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const element = document.createElement('div');
      element.style.textAlign = 'left';
      element.style.padding = '20px';
      element.innerHTML = textarea.value.replace(/\n/g, '<br>');
      
      const opt = {
          margin: 10,
          filename: 'document.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      window.html2pdf().set(opt).from(element).save();
    }
  };

  const handleExportDOCX = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <title>Document</title>
          </head>
          <body>${textarea.value.replace(/\n/g, '<br>')}</body>
          </html>
      `;
      
      const blob = new Blob([html], { type: 'application/msword' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'document.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Router>
      <Navbar 
        name='Text Editor' 
        mode={mode} 
        toggle={toggleMode} 
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />
      <Alert alert={alert} />
      <Routes>
        {/* <Route exact path="/" element={<Home />}/> */}
        <Route exact path="/" element={<Textarea mode={mode} alert={showAlert} />}/>
        <Route exact path="/About" element={<About />}/>
      </Routes>
    </Router>
  );
}

export default App;
