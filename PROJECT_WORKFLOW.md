# Project Management Workflow

## Overview
This document outlines the complete project workflow from creation to delivery, including all stakeholders and approval processes.

## Workflow Stages

### 1. Project Creation & Assignment
- **Action**: Project created
- **Responsible**: System/Manager
- **Next**: Assign to PC (Project Coordinator)

### 2. Initial Planning (PC Phase 1)
- **Responsible**: PC (Project Coordinator)
- **Tasks**:
  - Prepare sections for the website
  - Get approval of sections from client
- **Next**: Move to Design after client approval

### 3. Knowledge Transfer & Design
- **Action**: PC shares KT (Knowledge Transfer) to Designer
- **Responsible**: Designer
- **Tasks**:
  - Complete the design based on approved sections
  - Send completed design to PC
- **Next**: PC review and QA process

### 4. Design QA & Client Approval
- **Responsible**: PC
- **Tasks**:
  - Verify QA of design
  - Send to Design team for corrections (if needed)
  - Request client approval (if no corrections needed)
- **Decision Point**: 
  - If client approves: Update status and move to HTML
  - If corrections needed: Return to Design team

### 5. HTML Development
- **Responsible**: HTML Team
- **Tasks**:
  - Convert approved design to HTML
  - Send to QA for testing
- **Next**: QA testing phase

### 6. HTML QA Process
- **Responsible**: QA Team
- **Tasks**:
  - Test HTML implementation
  - Report bugs and move back to HTML team
- **Decision Point**:
  - If bugs found: Return to HTML for corrections
  - If approved: Move to DEV (Development)

### 7. HTML Bug Fixes & Retest
- **Responsible**: HTML Team
- **Tasks**:
  - Correct reported bugs
  - Send to QA for retesting
- **Next**: After QA approval, move to DEV

### 8. Development Phase
- **Responsible**: DEV Team
- **Tasks**:
  - Implement backend functionality
  - Complete development work
  - Send to QA for testing
- **Next**: Development QA phase

### 9. Development QA & Bug Separation
- **Responsible**: QA Team
- **Tasks**:
  - Test development implementation
  - Report bugs and separate them into:
    - HTML bugs
    - DEV bugs
- **Next**: Project moves to both HTML and DEV teams for fixes

### 10. Parallel Bug Fixing
- **Responsible**: HTML Team & DEV Team (parallel work)
- **Tasks**:
  - HTML team fixes HTML-related bugs
  - DEV team fixes development-related bugs
  - Both teams return fixes to QA
- **Next**: QA validation

### 11. Final QA Validation
- **Responsible**: QA Team
- **Tasks**:
  - Validate all bug fixes
- **Decision Point**:
  - If issues remain: Project rejection process
  - If no issues: Move to DELIVERY

### 12. Project Rejection Review (If Needed)
- **Responsible**: Managers
- **Tasks**:
  - Review rejected project with management team
  - Determine next steps
- **Next**: Based on review outcome

### 13. Delivery
- **Responsible**: PC/Delivery Team
- **Tasks**:
  - Final project delivery
  - Project completion
- **Status**: Project Complete

## Key Stakeholders
- **PC (Project Coordinator)**: Overall project management and client communication
- **Designer**: Visual design and user interface creation
- **HTML Team**: Frontend markup and styling implementation
- **DEV Team**: Backend development and functionality
- **QA Team**: Quality assurance and testing
- **Client**: Final approval authority
- **Managers**: Escalation and review authority

## Status Flow
1. Created → Assigned to PC
2. Planning → Client Approval
3. Design → Design QA
4. HTML Development → HTML QA
5. Development → Development QA
6. Bug Fixing → Final QA
7. Delivery → Complete

## Critical Decision Points
- Client approval of sections
- Client approval of design
- QA approval at each testing phase
- Management review for rejected projects