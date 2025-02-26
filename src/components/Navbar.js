import React from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'


export default function Navbar(prop) {
  let location = useLocation();
  return (
    <div>
      {/* <nav className={`navbar navbar-expand-lg navbar-${prop.mode} bg-${prop.mode}`}> */}
      <nav className={`navbar navbar-expand-lg navbar-dark bg-dark`}>
        <p className="navbar-brand my-0" to="/">{prop.name}</p>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ justifyContent: 'space-between' }}>
          <ul className="navbar-nav mr-auto">
            <li className="nav-iteNavbarm active">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Tool<span className="sr-only"></span></Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/About" ? "active" : ""}`} to="/About">About</Link>
            </li>
          </ul>  
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onClick={prop.toggle} />
                <label className="form-check-label text-white" htmlFor="flexSwitchCheckDefault">Dark Mode</label>
              </div>
            
          
        </div>
      </nav >
    </div>
  )
}
Navbar.propTypes = { name: PropTypes.string.isRequired };
Navbar.defaultProps = {
  name: "YOLO"
}