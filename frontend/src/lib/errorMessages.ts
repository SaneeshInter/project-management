import { Department } from '@/types';

interface ErrorMapping {
  pattern: RegExp;
  userMessage: string;
}

const departmentNames: Record<Department, string> = {
  [Department.PMO]: 'Project Management',
  [Department.DESIGN]: 'Design',
  [Department.HTML]: 'HTML Development',
  [Department.PHP]: 'PHP Development',
  [Department.REACT]: 'React Development',
  [Department.WORDPRESS]: 'WordPress Development',
  [Department.QA]: 'Quality Assurance',
  [Department.DELIVERY]: 'Delivery',
  [Department.MANAGER]: 'Management Review',
  [Department.SALES_EXE]: 'Sales Executive'
};

const errorMappings: ErrorMapping[] = [
  // Invalid transition patterns
  {
    pattern: /Invalid transition from (\w+) to (\w+)/,
    userMessage: 'This project cannot be moved directly from {from} to {to}. Please follow the standard workflow sequence.'
  },
  
  // Status requirement patterns
  {
    pattern: /Current department must be (\w+) before moving/,
    userMessage: 'The current department work must be marked as "{status}" before moving to the next stage.'
  },
  
  // QA requirement patterns
  {
    pattern: /QA testing must pass before proceeding/,
    userMessage: 'Quality assurance testing must be completed and passed before moving to the next department.'
  },
  
  // Approval requirement patterns
  {
    pattern: /Missing (\w+_?\w*) approval/,
    userMessage: 'Required approval is missing: {approval}. Please obtain the necessary approval before proceeding.'
  },
  
  // Work status patterns
  {
    pattern: /Work status must be (\w+)/,
    userMessage: 'The work status must be set to "{status}" before proceeding with this action.'
  },
  
  // Permission patterns
  {
    pattern: /Role (\w+) cannot (move projects|update work status)/,
    userMessage: 'You do not have permission to perform this action. Please contact your project manager.'
  },
  
  // Client approval patterns
  {
    pattern: /Client approval can only be requested from DESIGN department/,
    userMessage: 'Client approval can only be requested when the project is in the Design department.'
  },
  
  // QA testing patterns
  {
    pattern: /QA testing can only be requested from development departments/,
    userMessage: 'Quality assurance testing can only be initiated from development departments (HTML, PHP, React).'
  }
];

/**
 * Convert technical error messages to user-friendly messages
 */
export function standardizeErrorMessage(technicalMessage: string): string {
  for (const mapping of errorMappings) {
    const match = technicalMessage.match(mapping.pattern);
    if (match) {
      let userMessage = mapping.userMessage;
      
      // Replace placeholders with actual values
      if (match[1]) {
        // Handle department names
        const dept1 = match[1] as Department;
        const dept2 = match[2] as Department;
        
        if (departmentNames[dept1] && departmentNames[dept2]) {
          userMessage = userMessage
            .replace('{from}', departmentNames[dept1])
            .replace('{to}', departmentNames[dept2]);
        } else {
          // Handle status or approval types
          userMessage = userMessage
            .replace('{status}', formatStatusName(match[1]))
            .replace('{approval}', formatApprovalName(match[1]));
        }
      }
      
      return userMessage;
    }
  }
  
  // Fallback: return original message if no pattern matches
  return technicalMessage;
}

/**
 * Format status names for display
 */
function formatStatusName(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format approval type names for display
 */
function formatApprovalName(approvalType: string): string {
  const approvalNames: Record<string, string> = {
    'CLIENT_APPROVAL': 'Client Approval',
    'BEFORE_LIVE_QA': 'Pre-Launch QA Approval',
    'DESIGN_APPROVAL': 'Design Approval',
    'TECHNICAL_APPROVAL': 'Technical Approval'
  };
  
  return approvalNames[approvalType] || formatStatusName(approvalType);
}

/**
 * Get actionable suggestions based on error type
 */
export function getErrorSuggestion(technicalMessage: string): string {
  if (technicalMessage.includes('Invalid transition')) {
    return 'Please complete the current department\'s work before moving to the next stage.';
  }
  
  if (technicalMessage.includes('must be COMPLETED')) {
    return 'Mark the current department work as "Completed" in the work status section.';
  }
  
  if (technicalMessage.includes('QA testing must pass')) {
    return 'Submit the project for QA testing and ensure it passes before proceeding.';
  }
  
  if (technicalMessage.includes('Missing') && technicalMessage.includes('approval')) {
    return 'Request the required approval from the appropriate stakeholder.';
  }
  
  if (technicalMessage.includes('Role') && technicalMessage.includes('cannot')) {
    return 'Contact your project manager or admin to perform this action.';
  }
  
  return 'Please review the project requirements and ensure all prerequisites are met.';
}