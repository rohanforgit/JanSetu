import { errorResponse } from '../../utils/response.js';

const ALLOWED_CATEGORIES = [
  'Fire Hazard',
  'Electrical Hazard',
  'Road Damage',
  'Garbage',
  'Streetlight',
  'Water Leakage',
  'Drainage',
  'Traffic Signal',
  'Public Infrastructure',
  'Other'
];

const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const validateCreateIssue = (req, res, next) => {
  const { title, description, category, location, severity } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return errorResponse(res, 'Issue title is required and must be a non-empty string.', 'VALIDATION_ERROR', 400);
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return errorResponse(res, 'Issue description is required and must be a non-empty string.', 'VALIDATION_ERROR', 400);
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return errorResponse(
      res,
      `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
      'VALIDATION_ERROR',
      400
    );
  }

  if (!location || typeof location !== 'object') {
    return errorResponse(res, 'Location object containing latitude and longitude is required.', 'VALIDATION_ERROR', 400);
  }

  const { latitude, longitude } = location;
  if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
    return errorResponse(res, 'Location.latitude must be a valid numeric coordinate between -90 and 90.', 'VALIDATION_ERROR', 400);
  }

  if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
    return errorResponse(res, 'Location.longitude must be a valid numeric coordinate between -180 and 180.', 'VALIDATION_ERROR', 400);
  }

  if (severity && !ALLOWED_SEVERITIES.includes(severity)) {
    return errorResponse(res, `Severity if provided must be one of: ${ALLOWED_SEVERITIES.join(', ')}`, 'VALIDATION_ERROR', 400);
  }

  next();
};
