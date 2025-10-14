# Project Module Implementation Notes

## Overview
The project module has been redesigned to support multiple project types (starting with Residual Analysis) with a flexible, extensible architecture where all project-related data fields are nullable.

## Architecture

### Core Design Principles
1. **Unified Schema**: All project types share the same database tables
2. **Nullable Fields**: Fields are optional, allowing different project types to use different subsets
3. **Company Scoping**: Projects are scoped to companies (inherited from user's companyId)
4. **Draft Status**: Projects must be created with `DRAFT` status initially

### Database Tables

#### Core Tables
- `projects` - Base project information
- `project_types` - Available project types (residual_analysis, etc.)

#### Residual Analysis Tables (all nullable)
- `project_clients` - Client information (1:1 with project)
- `project_sources` - Source information (1:1 with project)
- `project_equipments` - Equipment details (1:N with project)
- `project_financials` - Financial information (1:1 with project)
- `project_transactions` - Transaction details (1:1 with project)
- `project_utilization_scenarios` - Utilization scenarios (1:N with project)

### Entity Relationships

```
Project
├── projectType (ManyToOne) → ProjectType
├── company (ManyToOne) → Company
├── createdBy (ManyToOne) → User
├── client (OneToOne) → ProjectClient
├── source (OneToOne) → ProjectSource
├── financial (OneToOne) → ProjectFinancial
├── transaction (OneToOne) → ProjectTransaction
├── equipments (OneToMany) → ProjectEquipment[]
├── utilizationScenarios (OneToMany) → ProjectUtilizationScenario[]
├── assets (OneToMany) → Asset[] (legacy)
└── reports (OneToMany) → Report[] (legacy)
```

## API Endpoints

### Get Project Types
```
GET /projects/types
Returns list of available project types for the creation modal
```

### Create Project
```
POST /projects
Body: {
  projectTypeCode: 'residual_analysis',
  name: 'Project Name',
  status: 'draft', // Only 'draft' allowed on creation
  startDate?: '2024-08-15',
  client?: { ... },
  source?: { ... },
  equipments?: [ ... ],
  financial?: { ... },
  transaction?: { ... },
  utilizationScenarios?: [ ... ]
}
```

### Other Endpoints
- `GET /projects` - List all projects (paginated, company-scoped)
- `GET /projects/:id` - Get project with all relations
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/dashboard/stats` - Get project statistics

## Key Features

### 1. Company Scoping
- Projects automatically inherit `companyId` from the creating user
- Non-admin users only see projects from their own company

### 2. Draft Status Enforcement
```typescript
// Only DRAFT status allowed during creation
if (createProjectDto.status && createProjectDto.status !== ProjectStatus.DRAFT) {
  throw new BadRequestException('Only DRAFT status is allowed during project creation');
}
```

### 3. Auto-Generated Project Number
Format: `PROJ-{YEAR}-{SEQUENCE}`
Example: `PROJ-2025-0001`

### 4. Flexible Form Data
All nested entities are optional. Example:
```typescript
{
  name: "Water Truck Project",
  projectTypeCode: "residual_analysis",
  // Only provide what you have
  client: { clientName: "John Doe" },
  // equipments, financial, etc. can be omitted
}
```

## How to Add New Project Types

1. **Add to ProjectType table**:
```typescript
{
  code: 'new_project_type',
  name: 'New Project Type',
  description: 'Description',
  isActive: true
}
```

2. **Create type-specific entities** (if needed):
   - Create new entity files in `src/entities/`
   - Add relationships to Project entity
   - Update DTOs in `src/modules/projects/dto/`

3. **Update service logic**:
   - Add repository injection in `ProjectsService`
   - Update `create()` method to handle new entities

4. **Update module**:
   - Add new entities to `ProjectsModule` imports

## Seeding Project Types

Run the seed script to populate project types:
```typescript
import { seedProjectTypes } from './seeds/seed-project-types';

// In your seed/migration
await seedProjectTypes(dataSource);
```

## DTOs Structure

```
CreateProjectDto
├── projectTypeCode: string (required)
├── name: string (required)
├── status?: ProjectStatus (defaults to DRAFT)
├── startDate?: string
├── endDate?: string
├── client?: CreateProjectClientDto
├── source?: CreateProjectSourceDto
├── equipments?: CreateProjectEquipmentDto[]
├── financial?: CreateProjectFinancialDto
├── transaction?: CreateProjectTransactionDto
└── utilizationScenarios?: CreateUtilizationScenarioDto[]
```

All nested DTOs have nullable fields marked with `@IsOptional()`.

## Migration Notes

### Breaking Changes
- Added `projectNumber` (unique, required)
- Added `companyId` (nullable, FK to companies)
- Added `projectTypeId` (nullable, FK to project_types)
- Changed default `status` from `PENDING` to `DRAFT`

### Backward Compatibility
- Old `assets` and `reports` relations maintained
- `description`, `endDate`, and `metadata` fields preserved

## Testing the API

### 1. Get Available Project Types
```bash
GET /projects/types
Authorization: Bearer {token}
```

### 2. Create Residual Analysis Project
```bash
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectTypeCode": "residual_analysis",
  "name": "Buneeon Sand Volvo A4GG Water Truck",
  "startDate": "2024-08-15",
  "client": {
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "lesseePhone": "+1234567890",
    "communicationPreference": true
  },
  "equipments": [{
    "industry": "Construction",
    "make": "Volvo",
    "model": "A4GG",
    "year": 2023
  }]
}
```

### 3. Get Project with All Data
```bash
GET /projects/{id}
Authorization: Bearer {token}
```

## Future Enhancements

1. **Update Support**: Currently only creation is fully implemented. Update logic needs to handle nested entity updates.

2. **Bulk Operations**: Add endpoints for bulk equipment/scenario management

3. **Validation**: Add business logic validation (e.g., scenarios must have associated equipment)

4. **File Uploads**: Add support for maintenance records, inspection reports as file uploads

5. **Status Transitions**: Implement state machine for status changes (DRAFT → PENDING → IN_PROGRESS → COMPLETED)

## Questions?

Contact the development team or refer to:
- Entity definitions: `src/entities/project*.entity.ts`
- Service logic: `src/modules/projects/projects.service.ts`
- API docs: Swagger UI at `/api`
