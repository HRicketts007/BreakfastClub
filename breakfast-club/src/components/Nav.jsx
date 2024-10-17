import React from 'react';

const Nav = () => {
    return (
        <nav className="navbar navbar-expand-lg  bg-warning fixed-top">
        <div className="container-fluid">
          <h3 className="navbar-brand fw-bold " >The Breakfast Club</h3>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            
          </div>
        </div>
      </nav>
    );
};

export default Nav;