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

const ALLOWED_DEPARTMENTS = [
  'Fire & Emergency Services',
  'Electricity & Power Board',
  'Roads & Infrastructure',
  'Solid Waste Management',
  'Jal Board / Water Works',
  'Drainage & Sewerage Board',
  'Public Safety & Municipal Traffic',
  'Urban Development',
  'Municipal Services'
];

const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const validateIssueAnalysisSchema = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is not a valid JSON object.');
  }

  const threshold = parseFloat(process.env.CIVIC_ISSUE_THRESHOLD || '0.50');
  const rawConfidence = typeof data.confidence === 'number' && !isNaN(data.confidence) ? data.confidence : 0.9;
  const confidence = Number(rawConfidence.toFixed(2));

  const evidenceStatus = data.evidenceStatus || (data.isCivicIssue === false ? (data.consistency === 'CONTRADICTORY' ? 'CONTRADICTORY' : 'INVALID_EVIDENCE') : 'VERIFIED');
  const consistency = data.consistency || (data.isCivicIssue === false ? 'CONTRADICTORY' : 'MATCH');
  const isExplicitNonCivicCategory = data.category === 'OUT OF CONTEXT' || data.category === 'OUT_OF_CONTEXT' || data.category === 'UNCONFIRMED' || data.category === 'UNKNOWN';
  const isExplicitNonCivicDept = data.department === 'NOT ASSIGNED' || data.department === 'OUT OF CONTEXT' || data.department === 'UNKNOWN';

  const isCivic = data.isCivicIssue === true
    && evidenceStatus === 'VERIFIED'
    && consistency !== 'CONTRADICTORY'
    && !isExplicitNonCivicCategory
    && !isExplicitNonCivicDept
    && confidence >= threshold;

  // STRICT CONTRACT FOR EXPLICIT OUT-OF-CONTEXT / NON-CIVIC / CONTRADICTORY IMAGES
  if (!isCivic) {
    const isContradictory = evidenceStatus === 'CONTRADICTORY' || consistency === 'CONTRADICTORY';
    const isNeedsBetterPhoto = evidenceStatus === 'NEEDS_BETTER_PHOTO';

    const defaultTitle = isContradictory
      ? 'CLAIM NOT VISUALLY VERIFIED'
      : (isNeedsBetterPhoto ? 'NEEDS BETTER PHOTO' : 'INSUFFICIENT / INVALID CIVIC EVIDENCE');

    const defaultReasoning = isContradictory
      ? 'Your voice description mentions a civic issue, but the uploaded image does not provide visual evidence to support or verify it.'
      : 'The uploaded image does not provide sufficient visual evidence of a public municipal civic issue.';

    return {
      isCivicIssue: false,
      confidence: Math.min(confidence, 0.4),
      evidenceStatus: isContradictory ? 'CONTRADICTORY' : (isNeedsBetterPhoto ? 'NEEDS_BETTER_PHOTO' : 'INVALID_EVIDENCE'),
      consistency: isContradictory ? 'CONTRADICTORY' : 'UNKNOWN',
      visualIssueDetected: false,
      issueTitle: typeof data.issueTitle === 'string' && data.issueTitle.trim().length > 0 && !data.issueTitle.includes('UNKNOWN')
        ? data.issueTitle.trim()
        : defaultTitle,
      summary: defaultTitle,
      description: typeof data.description === 'string' && data.description.trim().length > 0 && !data.description.includes('UNKNOWN')
        ? data.description.trim()
        : defaultReasoning,
      category: 'UNCONFIRMED',
      department: 'NOT ASSIGNED',
      severity: 'N/A',
      priority: 0,
      reasoning: typeof data.reasoning === 'string' && data.reasoning.trim().length > 0 && !data.reasoning.includes('UNKNOWN')
        ? data.reasoning.trim()
        : defaultReasoning,
      photoDescription: typeof data.photoDescription === 'string' && data.photoDescription.trim().length > 0
        ? data.photoDescription.trim()
        : 'Out of context / unverified image evidence provided.',
      detectedLanguage: 'en'
    };
  }

  const category = ALLOWED_CATEGORIES.includes(data.category) ? data.category : 'Road Damage';
  const department = ALLOWED_DEPARTMENTS.includes(data.department) ? data.department : 'Roads & Infrastructure';
  const severity = ALLOWED_SEVERITIES.includes(data.severity) ? data.severity : 'HIGH';

  const priority = Number(data.priority);
  const validPriority = isNaN(priority) || priority < 0 || priority > 100 ? 85 : Math.round(priority);

  const summary = typeof data.issueTitle === 'string' && data.issueTitle.trim().length > 0 && data.issueTitle !== 'UNKNOWN' && data.issueTitle !== 'OUT OF CONTEXT'
    ? data.issueTitle.trim()
    : (typeof data.summary === 'string' && data.summary.trim().length > 0 && data.summary !== 'UNKNOWN' && data.summary !== 'OUT OF CONTEXT' ? data.summary.trim() : 'Road Surface Defect / Pothole');

  const reasoning = typeof data.reasoning === 'string' && data.reasoning.trim().length > 0 && data.reasoning !== 'UNKNOWN'
    ? data.reasoning.trim()
    : 'Photo evidence confirms visible road surface damage / pothole on the public roadway.';

  return {
    isCivicIssue: true,
    confidence,
    evidenceStatus: 'VERIFIED',
    consistency: data.consistency || 'MATCH',
    visualIssueDetected: true,
    issueTitle: summary,
    summary,
    description: typeof data.description === 'string' && data.description.trim().length > 0 && data.description !== 'UNKNOWN' && data.description !== 'OUT OF CONTEXT' ? data.description.trim() : summary,
    category,
    department,
    severity,
    priority: validPriority,
    duplicateRisk: 0,
    reasoning,
    photoDescription: typeof data.photoDescription === 'string' && data.photoDescription.trim().length > 0 && !data.photoDescription.includes('Visual evidence confirmed')
      ? data.photoDescription.trim()
      : (typeof data.description === 'string' && data.description.trim().length > 0 && data.description !== 'OUT OF CONTEXT' ? data.description.trim() : reasoning),
    detectedLanguage: 'en'
  };
};
