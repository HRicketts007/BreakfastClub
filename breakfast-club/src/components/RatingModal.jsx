import React, { useState } from 'react';

const RatingModal = ({ recipeId, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting rating:', { recipeId, rating, review });
<<<<<<< HEAD
      const response = await fetch('http://localhost:6969/create_rating', {
=======
      const response = await fetch('http://45.56.112.26:6969/create_rating', {
>>>>>>> 91b17d1b158c1520fd8541d7e4ac947af640a8d5
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          rating: rating,
          review: review
        })
      });
      
      if (response.ok) {
        console.log('Rating submitted successfully');
        onRatingSubmit();
        setRating(0);
        setReview('');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div 
      className="modal fade" 
      id="ratingModal" 
      tabIndex="-1" 
      aria-labelledby="ratingModalLabel" 
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="ratingModalLabel">Rate this Recipe</h5>
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3 text-center">
                <div className="d-flex justify-content-center gap-2">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <i
                        key={ratingValue}
                        className={`bi bi-star${ratingValue <= (hover || rating) ? '-fill' : ''} text-warning fs-4`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="review" className="form-label">Review</label>
                <textarea
                  className="form-control"
                  id="review"
                  rows="3"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this recipe..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="btn btn-warning"
                disabled={!rating}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal; 