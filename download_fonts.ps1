$baseUrl = "https://raw.githubusercontent.com/jimp-dev/jimp/main/packages/plugin-print/fonts/open-sans"
$fonts = @(
    "open-sans-32-black/open-sans-32-black.fnt",
    "open-sans-32-black/open-sans-32-black.png",
    "open-sans-16-black/open-sans-16-black.fnt",
    "open-sans-16-black/open-sans-16-black.png"
)

New-Item -ItemType Directory -Force -Path "E:\hasilkuuy\edit\id_card_recreation\api\public\fonts"

foreach ($font in $fonts) {
    $url = "$baseUrl/$font"
    $filename = $font.Split("/")[-1]
    $output = "E:\hasilkuuy\edit\id_card_recreation\api\public\fonts\$filename"
    
    Write-Host "Downloading $filename..."
    Invoke-WebRequest -Uri $url -OutFile $output
}
