/**
 * Inventory Management Validation
 * Client-side validation for add inventory and add classification forms
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory form validation
    const inventoryForm = document.getElementById('inventory-form');
    if (inventoryForm) {
        inventoryForm.addEventListener('submit', validateAddInventory);
    }
    
    // Initialize classification form validation
    const classificationForm = document.getElementById('classification-form');
    if (classificationForm) {
        classificationForm.addEventListener('submit', validateAddClassification);
    }
});

/**
 * Validate Add Inventory Form
 * Validates all vehicle fields before form submission
 */
function validateAddInventory(e) {
    const form = e.target;
    let isValid = true;
    let errorMessage = '';
    
    // Classification validation
    const classificationId = form.classification_id.value;
    if (!classificationId) {
        isValid = false;
        errorMessage += 'Please select a classification.\n';
    }
    
    // Make validation
    const make = form.inv_make.value.trim();
    if (!make) {
        isValid = false;
        errorMessage += 'Make is required.\n';
    } else if (make.length > 50) {
        isValid = false;
        errorMessage += 'Make must be less than 50 characters.\n';
    }
    
    // Model validation
    const model = form.inv_model.value.trim();
    if (!model) {
        isValid = false;
        errorMessage += 'Model is required.\n';
    } else if (model.length > 50) {
        isValid = false;
        errorMessage += 'Model must be less than 50 characters.\n';
    }
    
    // Year validation
    const year = parseInt(form.inv_year.value);
    const currentYear = new Date().getFullYear();
    if (!year || year < 1900 || year > currentYear + 1) {
        isValid = false;
        errorMessage += 'Please provide a valid year between 1900 and ' + (currentYear + 1) + '.\n';
    }
    
    // Price validation
    const price = parseFloat(form.inv_price.value);
    if (!price || price < 0) {
        isValid = false;
        errorMessage += 'Price must be a positive number.\n';
    }
    
    // Mileage validation
    const miles = parseInt(form.inv_miles.value);
    if (!miles || miles < 0) {
        isValid = false;
        errorMessage += 'Mileage must be a positive number.\n';
    }
    
    // Color validation
    const color = form.inv_color.value.trim();
    if (!color) {
        isValid = false;
        errorMessage += 'Color is required.\n';
    } else if (color.length > 30) {
        isValid = false;
        errorMessage += 'Color must be less than 30 characters.\n';
    }
    
    // Description validation
    const description = form.inv_description.value.trim();
    if (!description) {
        isValid = false;
        errorMessage += 'Description is required.\n';
    }
    
    // Image paths validation
    const imagePath = form.inv_image.value.trim();
    const thumbnailPath = form.inv_thumbnail.value.trim();
    if (!imagePath) {
        isValid = false;
        errorMessage += 'Image path is required.\n';
    }
    if (!thumbnailPath) {
        isValid = false;
        errorMessage += 'Thumbnail path is required.\n';
    }
    
    // Show error message if validation fails
    if (!isValid) {
        e.preventDefault();
        alert('Please fix the following errors:\n' + errorMessage);
        return false;
    }
    
    return true;
}

/**
 * Validate Add Classification Form
 * Validates classification name before form submission
 */
function validateAddClassification(e) {
    const classificationName = document.getElementById('classification_name').value.trim();
    
    if (!classificationName) {
        e.preventDefault();
        alert('Classification name is required.');
        return false;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(classificationName)) {
        e.preventDefault();
        alert('Classification name cannot contain spaces or special characters. Only letters and numbers are allowed.');
        return false;
    }
    
    if (classificationName.length > 50) {
        e.preventDefault();
        alert('Classification name must be less than 50 characters.');
        return false;
    }
    
    return true;
}
