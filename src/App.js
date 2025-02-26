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
  return (
    <Router>
      <Navbar name='Text Editor' mode={mode} toggle={toggleMode} />
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
