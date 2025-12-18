"use client";

import { createReview } from "@/services/apiService";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ReviewModalProps {
  bookingId: string;
  onClose: () => void;
  onReviewSubmit: () => void; 
}

export function ReviewModal({ bookingId, onClose, onReviewSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    setIsLoading(true);

    try {
      // Use the dedicated service function
      const promise = createReview({ bookingId, rating, comment });

      await toast.promise(promise, {
        loading: 'Submitting your review...',
        success: () => {
          onReviewSubmit();
          onClose();
          return <b>Review submitted successfully!</b>;
        },
        error: (err) => {
          const errorMessage = err instanceof Error && 'response' in err && 
            err.response && typeof err.response === 'object' && 
            'data' in err.response && err.response.data && 
            typeof err.response.data === 'object' && 'message' in err.response.data
            ? String(err.response.data.message)
            : "Failed to submit review!";
          return <b>{errorMessage}</b>;
        },
      });
    } catch (error) {
      console.error("Review submission failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">Leave a Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-white">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 text-2xl transition-colors duration-200 ${
                    rating >= star ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}