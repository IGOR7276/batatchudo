$enc = New-Object System.Text.UTF8Encoding $false
$bytes = [System.IO.File]::ReadAllBytes("C:\Users\igori\Downloads\Batatchudo\js\data.js")
$content = $enc.GetString($bytes)

# Try different patterns
$count1 = [regex]::Matches($content, 'name:').Count
Write-Host "Pattern 'name:' count: $count1"

$count2 = [regex]::Matches($content, '(?s)\{[^{}]*?id:\s*\d+[^{}]*?\}').Count
Write-Host "Object pattern count: $count2"

# Simpler: just find id and look around
$idx = $content.IndexOf('id: 9')
Write-Host "id: 9 at index: $idx"
if ($idx -gt 0) {
    Write-Host "Context: ...$($content.Substring([Math]::Max(0, $idx-10), 50))..."
}
