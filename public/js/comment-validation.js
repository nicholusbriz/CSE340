/* ***************************
 *  Comment Form Validation
 * ************************** */

// Character counter
function updateCharCount() {
  const textarea = document.getElementById('comment_text');
  const charCount = document.getElementById('char-count');
  const currentLength = textarea.value.length;
  const maxLength = 1000;
  
  if (charCount) {
    charCount.textContent = `${currentLength} / ${maxLength} characters`;
    
    // Change color based on length
    if (currentLength > maxLength * 0.9) {
      charCount.style.color = '#dc3545'; // Red
    } else if (currentLength > maxLength * 0.7) {
      charCount.style.color = '#ffc107'; // Yellow
    } else {
      charCount.style.color = '#6c757d'; // Gray
    }
  }
}

// Validate comment form
function validateCommentForm() {
  const commentText = document.getElementById('comment_text');
  const submitButton = document.getElementById('submit-comment');
  
  if (!commentText) return false;
  
  const text = commentText.value.trim();
  
  // Check if empty
  if (text.length === 0) {
    showError('Comment cannot be empty');
    return false;
  }
  
  // Check length
  if (text.length > 1000) {
    showError('Comment must be less than 1000 characters');
    return false;
  }
  
  // Check for valid characters (basic validation)
  if (!/^[a-zA-Z0-9\s.,!?'"\-@#$%&*()_+=:;\n\r]+$/.test(text)) {
    showError('Comment contains invalid characters');
    return false;
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /http[s]?:\/\/[^\s]+/gi, // URLs
    /\b(buy|sell|free|click|win|prize)\b/gi, // Spam words
    /\$[0-9]+/g // Money patterns
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      showError('Comment appears to be spam');
      return false;
    }
  }
  
  return true;
}

// Show error message
function showError(message) {
  // Remove existing error
  const existingError = document.querySelector('.comment-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'comment-error alert alert-danger';
  errorDiv.textContent = message;
  
  // Insert error before form
  const form = document.getElementById('comment-form');
  if (form) {
    form.parentNode.insertBefore(errorDiv, form);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Clear error messages
function clearErrors() {
  const errors = document.querySelectorAll('.comment-error');
  errors.forEach(error => error.remove());
}

// Initialize validation
document.addEventListener('DOMContentLoaded', function() {
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment_text');
  
  if (commentText) {
    // Add character counter
    commentText.addEventListener('input', updateCharCount);
    commentText.addEventListener('keyup', updateCharCount);
    
    // Initialize character count
    updateCharCount();
  }
  
  if (commentForm) {
    // Add form validation
    commentForm.addEventListener('submit', function(e) {
      if (!validateCommentForm()) {
        e.preventDefault();
        return false;
      }
      
      // Show loading state
      const submitButton = document.getElementById('submit-comment');
      const submitText = document.getElementById('submit-text');
      const submitLoading = document.getElementById('submit-loading');
      
      if (submitButton && submitText && submitLoading) {
        submitButton.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
      }
    });
    
    // Clear errors on input
    commentForm.addEventListener('input', clearErrors);
  }
});

// Export functions for external use
window.CommentValidation = {
  validateCommentForm,
  updateCharCount,
  showError,
  clearErrors
};
