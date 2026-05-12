# Migration script: Replace Nebular imports with Angular Material in all .ts files
# Phase 3 & 4: List components and form-dialog components

$basePath = "C:\Users\di\Desktop\app_lbs\lbs-frontend\src\app\features"

# Get all .ts files that import from @nebular/theme
$files = Get-ChildItem -Path $basePath -Recurse -Include "*.ts" | Select-String -Pattern "@nebular/theme" | Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $original = $content

    # ---- STEP 1: Replace Nebular import block with Material imports ----
    # Remove the entire Nebular import block (multi-line or single-line)
    $content = $content -replace '(?ms)import\s*\{[^}]*\}\s*from\s*''@nebular/theme''\s*;?\s*\r?\n?', ''
    $content = $content -replace "import\s*\{[^}]*\}\s*from\s*'@nebular/theme'\s*;?\s*\r?\n?", ''
    
    # ---- STEP 2: Add Angular Material imports if not already present ----
    # Check what Nebular components were used and add corresponding Material imports
    $needsCardModule = $original -match 'NbCardModule'
    $needsButtonModule = $original -match 'NbButtonModule' -and -not ($content -match 'MatButtonModule')
    $needsInputModule = $original -match 'NbInputModule' -and -not ($content -match 'MatInputModule')
    $needsIconModule = $original -match 'NbIconModule' -and -not ($content -match 'MatIconModule')
    $needsSpinnerModule = $original -match 'NbSpinnerModule'
    $needsFormFieldModule = $original -match 'NbFormFieldModule' -and -not ($content -match 'MatFormFieldModule')
    $needsTooltipModule = $original -match 'NbTooltipModule'
    $needsAlertModule = $original -match 'NbAlertModule'
    $needsSelectModule = $original -match 'NbSelectModule'

    $matImports = @()
    if ($needsCardModule) { $matImports += "import { MatCardModule } from '@angular/material/card';" }
    if ($needsButtonModule) { $matImports += "import { MatButtonModule } from '@angular/material/button';" }
    if ($needsInputModule) { $matImports += "import { MatInputModule } from '@angular/material/input';`nimport { MatFormFieldModule } from '@angular/material/form-field';" }
    if ($needsIconModule) { $matImports += "import { MatIconModule } from '@angular/material/icon';" }
    if ($needsSpinnerModule) { $matImports += "import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';" }
    if ($needsFormFieldModule -and -not $needsInputModule) { $matImports += "import { MatFormFieldModule } from '@angular/material/form-field';" }
    if ($needsTooltipModule) { $matImports += "import { MatTooltipModule } from '@angular/material/tooltip';" }
    if ($needsSelectModule) { $matImports += "import { MatSelectModule } from '@angular/material/select';" }

    # Insert Material imports after the last existing import
    if ($matImports.Count -gt 0) {
        $importBlock = ($matImports -join "`n") + "`n"
        # Find the last import statement
        if ($content -match '(?ms)(.*)(import\s+\{[^}]+\}\s+from\s+''[^'']+'';\s*\r?\n)(.*)$') {
            # Not reliable with regex, use line-by-line approach
        }
        # Simpler: just add them at the top after the first import
        $lines = $content -split "`n"
        $lastImportIndex = -1
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import\s") { $lastImportIndex = $i }
        }
        if ($lastImportIndex -ge 0) {
            $before = $lines[0..$lastImportIndex] -join "`n"
            $after = $lines[($lastImportIndex+1)..($lines.Count-1)] -join "`n"
            $content = $before + "`n" + $importBlock + $after
        }
    }

    # ---- STEP 3: Replace Nebular module names in imports array ----
    $content = $content -replace 'NbCardModule', 'MatCardModule'
    $content = $content -replace 'NbButtonModule', 'MatButtonModule'
    $content = $content -replace 'NbInputModule', 'MatInputModule, MatFormFieldModule'
    $content = $content -replace 'NbIconModule', 'MatIconModule'
    $content = $content -replace 'NbSpinnerModule', 'MatProgressSpinnerModule'
    $content = $content -replace 'NbFormFieldModule,?\s*', ''
    $content = $content -replace 'NbTooltipModule', 'MatTooltipModule'
    $content = $content -replace 'NbAlertModule,?\s*', ''
    $content = $content -replace 'NbSelectModule', 'MatSelectModule'
    $content = $content -replace 'NbLayoutModule,?\s*', ''

    # Clean up trailing commas and empty lines
    $content = $content -replace ',\s*,', ','
    $content = $content -replace ',(\s*\])', '$1'
    
    # Only write if changed
    if ($content -ne $original) {
        Set-Content $file $content -NoNewline
        Write-Host "Migrated: $($file -replace [regex]::Escape($basePath), '')"
    }
}

Write-Host "`nDone! Migrated $($files.Count) files."
