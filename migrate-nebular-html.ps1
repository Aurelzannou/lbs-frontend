# Migration script: Replace Nebular HTML elements with Angular Material in all .html files

$basePath = "C:\Users\di\Desktop\app_lbs\lbs-frontend\src\app"

# Get all .html files that contain nb- elements
$files = Get-ChildItem -Path $basePath -Recurse -Include "*.html" | Select-String -Pattern "nb-" | Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $original = $content

    # ---- nb-card structure -> mat-card ----
    $content = $content -replace '<nb-card\b([^>]*)>', '<mat-card$1>'
    $content = $content -replace '</nb-card>', '</mat-card>'
    $content = $content -replace '<nb-card-header\b([^>]*)>', '<mat-card-header$1>'
    $content = $content -replace '</nb-card-header>', '</mat-card-header>'
    $content = $content -replace '<nb-card-body\b([^>]*)>', '<mat-card-content$1>'
    $content = $content -replace '</nb-card-body>', '</mat-card-content>'
    $content = $content -replace '<nb-card-footer\b([^>]*)>', '<mat-card-actions$1>'
    $content = $content -replace '</nb-card-footer>', '</mat-card-actions>'
    
    # ---- nb-icon -> mat-icon ----
    # nb-icon with icon attribute: <nb-icon icon="xxx-outline"></nb-icon>  -> <mat-icon>xxx</mat-icon>
    $content = $content -replace '<nb-icon\s+icon="([^"]+)"(?:\s+pack="[^"]*")?>', '<mat-icon>'
    $content = $content -replace '<nb-icon\s+\[icon\]="([^"]+)">', '<mat-icon>'
    $content = $content -replace '</nb-icon>', '</mat-icon>'
    
    # ---- nbInput -> matInput ----
    $content = $content -replace '\s+nbInput\b', ' matInput'
    $content = $content -replace '\s+fullWidth\b', ''
    $content = $content -replace '\s+shape="semi-round"', ''
    $content = $content -replace '\[status\]="[^"]*"', ''
    
    # ---- nb-form-field -> mat-form-field ----
    $content = $content -replace '<nb-form-field>', '<mat-form-field appearance="outline" class="full-width">'
    $content = $content -replace '</nb-form-field>', '</mat-form-field>'
    $content = $content -replace '\s+nbPrefix\b', ' matPrefix'
    $content = $content -replace '\s+nbSuffix\b', ' matSuffix'
    
    # ---- nbButton -> mat-button variants ----
    $content = $content -replace '\s+nbButton\s+fullWidth\s+status="primary"\s+size="large"', ' mat-flat-button color="primary" style="width:100%"'
    $content = $content -replace '\s+nbButton\s+status="primary"\s+shape="semi-round"', ' mat-flat-button color="primary"'
    $content = $content -replace '\s+nbButton\s+status="basic"\s+appearance="ghost"', ' mat-button'
    $content = $content -replace '\s+nbButton\s+ghost\s+status="basic"', ' mat-icon-button'
    $content = $content -replace '\s+nbButton\s+ghost\b', ' mat-icon-button'
    $content = $content -replace '\s+nbButton\s+status="primary"\s+size="small"', ' mat-flat-button color="primary"'
    $content = $content -replace '\s+nbButton\b', ' mat-button'
    
    # ---- nb-alert -> div.alert ----
    $content = $content -replace '<nb-alert\s+\*ngIf="([^"]+)"\s+status="danger"\s+closable\s+\(close\)="([^"]+)">', '@if ($1) {<div class="alert alert-danger"><button class="alert-close" (click)="$2">&times;</button>'
    $content = $content -replace '<nb-alert\s+status="danger"\s*>', '<div class="alert alert-danger">'
    $content = $content -replace '<nb-alert\s+status="success"\s*>', '<div class="alert alert-success">'
    $content = $content -replace '</nb-alert>', '</div>}'
    
    # ---- [nbSpinner] -> loading overlay (simplified) ----
    $content = $content -replace '\s+\[nbSpinner\]="[^"]*"\s+nbSpinnerStatus="[^"]*"', ''
    $content = $content -replace '\s+\[nbSpinner\]="[^"]*"', ''
    $content = $content -replace '\s+nbSpinnerStatus="[^"]*"', ''
    
    # ---- nb-select -> mat-select ----
    $content = $content -replace '<nb-select\b([^>]*)>', '<mat-select$1>'
    $content = $content -replace '</nb-select>', '</mat-select>'
    $content = $content -replace '<nb-option\b([^>]*)>', '<mat-option$1>'
    $content = $content -replace '</nb-option>', '</mat-option>'

    # Only write if changed
    if ($content -ne $original) {
        Set-Content $file $content -NoNewline
        Write-Host "Migrated HTML: $($file -replace [regex]::Escape($basePath), '')"
    }
}

Write-Host "`nHTML migration done!"
