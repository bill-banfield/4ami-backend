const fs = require('fs');
const path = require('path');

// Map of files to unused imports/variables to remove
const fixes = {
  'src/main.ts': ['ClassSerializerInterceptor'],
  'src/modules/ai/ai.controller.ts': ['Roles', 'UserRole'],
  'src/modules/ai/ai.module.ts': ['ConfigModule'],
  'src/modules/asset-classes/asset-classes.controller.ts': ['CurrentUser', 'User'],
  'src/modules/assets/assets.controller.ts': ['UseGuards', 'Roles', 'UserRole'],
  'src/modules/email/dto/send-invitation.dto.ts': ['IsOptional'],
  'src/modules/email/email.module.ts': ['MailerModule'],
  'src/modules/industries/industries.controller.ts': ['CurrentUser', 'User'],
  'src/modules/makes/makes.controller.ts': ['CurrentUser', 'User'],
  'src/modules/models/models.controller.ts': ['CurrentUser', 'User'],
  'src/modules/projects/dto/create-utilization-scenario.dto.ts': ['IsString'],
  'src/modules/projects/projects.controller.ts': ['UseGuards', 'Roles', 'UserRole'],
  'src/modules/projects/projects.service.ts': ['In'],
  'src/modules/reports/reports.controller.ts': ['UseGuards', 'Roles', 'UserRole'],
  'src/modules/users/dto/user-response.dto.ts': ['CompanyResponseDto'],
  'src/modules/users/users.controller.ts': ['UseGuards'],
};

Object.entries(fixes).forEach(([file, unusedItems]) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  unusedItems.forEach(item => {
    // Remove from destructured imports: { Item, Other }
    content = content.replace(new RegExp(`,?\s*${item}\s*,?`, 'g'), (match) => {
      if (match.startsWith(',')) return '';
      if (match.endsWith(',')) return '';
      return '';
    });
    
    // Remove entire import if it's standalone
    content = content.replace(new RegExp(`import\s+\{?\s*${item}\s*\}?\s+from[^;]+;\n?`, 'g'), '');
    
    // Clean up empty braces in imports
    content = content.replace(/import\s+\{\s*\}\s+from[^;]+;\n?/g, '');
    
    // Clean up double commas
    content = content.replace(/,\s*,/g, ',');
    
    // Clean up trailing commas in import braces
    content = content.replace(/\{\s*,/g, '{');
    content = content.replace(/,\s*\}/g, '}');
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
