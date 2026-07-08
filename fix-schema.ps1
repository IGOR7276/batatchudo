$root = "C:\Users\igori\Downloads\Batatchudo"
$dataFile = Join-Path $root "js\data.js"
$enc = New-Object System.Text.UTF8Encoding $false
$content = $enc.GetString([System.IO.File]::ReadAllBytes($dataFile))

# Build price map (unquoted property names)
$priceMap = @{}
$objMatches = [regex]::Matches($content, '(?s)\{[^{}]*?id:\s*\d+[^{}]*?\}')
foreach ($om in $objMatches) {
    $obj = $om.Value
    $nM = [regex]::Match($obj, 'name:\s*"([^"]+)"')
    $pM = [regex]::Match($obj, 'price:\s*"([^"]*)"')
    if ($nM.Success -and $pM.Success -and -not $priceMap.ContainsKey($nM.Groups[1].Value)) {
        $priceMap[$nM.Groups[1].Value] = $pM.Groups[1].Value
    }
}

Write-Host "Loaded $($priceMap.Count) varieties"
if ($priceMap.Count -gt 0) {
    $keys = @($priceMap.Keys) | Select-Object -First 5
    foreach ($k in $keys) { Write-Host "  $k => $($priceMap[$k])" }
}

$files = Get-ChildItem -Path $root -Filter "*.html" | Where-Object {
    $c = $enc.GetString([System.IO.File]::ReadAllBytes($_.FullName))
    $c -match '"@type":\s*"Product"' -and $c -notmatch '"offers"\s*:'
}

Write-Host "Found $($files.Count) HTML files to update"
$updated = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $html = $enc.GetString($bytes)

    $jsonBlock = [regex]::Match($html, '(?s)<script type="application/ld\+json">\s*(\{.*?\})\s*</script>')
    if (-not $jsonBlock.Success) { continue }

    $nameMatch = [regex]::Match($jsonBlock.Groups[1].Value, '"name":\s*"([^"]+)"')
    if (-not $nameMatch.Success) { continue }

    $varietyName = $nameMatch.Groups[1].Value
    $price = if ($priceMap.ContainsKey($varietyName)) { $priceMap[$varietyName] } else { "" }

    $priceNum = 0.0
    $numMatch = [regex]::Match($price, '(\d+(?:\s\d+)*)')
    if ($numMatch.Success) {
        $cleaned = $numMatch.Groups[1].Value -replace '\s',''
        [double]::TryParse($cleaned, [ref]$priceNum) | Out-Null
    }

    $seller = "Centr razvitiya batata Lutsan"

    if ($priceNum -gt 0.0) {
        $offersJson = "  ,`n  `"offers`": {`n    `"@type`": `"Offer`",`n    `"price`": `"$priceNum`",`n    `"priceCurrency`": `"RUB`",`n    `"availability`": `"https://schema.org/InStock`",`n    `"url`": `"https://batatchudo.com/$($file.BaseName).html`",`n    `"seller`": {`n      `"@type`": `"Organization`",`n      `"name`": `"$seller`"`n    }`n  }"
    } else {
        $offersJson = "  ,`n  `"offers`": {`n    `"@type`": `"Offer`",`n    `"availability`": `"https://schema.org/OutOfStock`",`n    `"priceCurrency`": `"RUB`",`n    `"url`": `"https://batatchudo.com/price.html`",`n    `"seller`": {`n      `"@type`": `"Organization`",`n      `"name`": `"$seller`"`n    }`n  }"
    }

    $oldJson = $jsonBlock.Groups[1].Value
    $lastBrace = $oldJson.LastIndexOf('}')
    if ($lastBrace -lt 0) { continue }

    $beforeBrace = $oldJson.Substring(0, $lastBrace)
    $newJson = $beforeBrace + $offersJson + "`n}"
    $newHtml = $html.Replace($oldJson, $newJson)

    if ($newHtml -ne $html) {
        # Write with UTF-8 BOM to preserve Cyrillic encoding
        $utf8Bom = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::WriteAllText($file.FullName, $newHtml, $utf8Bom)
        $updated++
    }
}

Write-Host "Updated: $updated"
