import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Nav = ({auth, setAuth}) => {
    const navigate = useNavigate();
    console.log(auth);
    
    const handleLogout = async () => {
        try {
            const response = await axios.get('http://45.56.112.26:6969/logout', {
                withCredentials: true // Include credentials in the request
            });
            setAuth(false);
            localStorage.removeItem('isAuthenticated');
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            // Still logout on frontend even if backend fails
            setAuth(false);
            localStorage.removeItem('isAuthenticated');
            navigate('/login');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-warning">
            <div className="container-fluid">
                <h3 className="navbar-brand fw-bold">The Breakfast Club</h3>
                 
                {auth && (
                    <button 
                        className="btn btn-dark" 
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                )}
             
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav"></div>
               
            </div>
        </nav>
    );
};

export default Nav;
