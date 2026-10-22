Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot/public/source-icon.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$greenColor = [System.Drawing.Color]::FromArgb(255, 49, 69, 58) # #31453a
$srcRect = New-Object System.Drawing.Rectangle(254, 242, 516, 538)

function Generate-SquircleIcon {
    param(
        [int]$Size,
        [string]$OutputFile
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.Clear([System.Drawing.Color]::Transparent)

    $pad = [int]($Size * 0.04)
    $rSize = $Size - ($pad * 2)
    $radius = [int]($rSize * 0.22)

    $gPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $gPath.AddArc($pad, $pad, $d, $d, 180, 90)
    $gPath.AddArc($pad + $rSize - $d, $pad, $d, $d, 270, 90)
    $gPath.AddArc($pad + $rSize - $d, $pad + $rSize - $d, $d, $d, 0, 90)
    $gPath.AddArc($pad, $pad + $rSize - $d, $d, $d, 90, 90)
    $gPath.CloseFigure()

    $brushBg = New-Object System.Drawing.SolidBrush($greenColor)
    $g.FillPath($brushBg, $gPath)
    $brushBg.Dispose()

    $g.SetClip($gPath)
    $destRect = New-Object System.Drawing.Rectangle($pad, $pad, $rSize, $rSize)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()

    $gPath.Dispose()
    $g.Dispose()

    $bmp.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created squircle: $OutputFile ($Size x $Size)"
}

function Generate-MaskableIcon {
    param(
        [int]$Size,
        [string]$OutputFile
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Full bleed background for maskable
    $brushBg = New-Object System.Drawing.SolidBrush($greenColor)
    $g.FillRectangle($brushBg, 0, 0, $Size, $Size)

    # Inset artwork safely inside 80% circle (scale ~0.78)
    $targetSize = [int]($Size * 0.78)
    $offset = [int](($Size - $targetSize) / 2)
    $destRect = New-Object System.Drawing.Rectangle($offset, $offset, $targetSize, $targetSize)

    # Clip drawing to squircle path so outer cream corners are never drawn
    $radius = [int]($targetSize * 0.22)
    $gPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $gPath.AddArc($offset, $offset, $d, $d, 180, 90)
    $gPath.AddArc($offset + $targetSize - $d, $offset, $d, $d, 270, 90)
    $gPath.AddArc($offset + $targetSize - $d, $offset + $targetSize - $d, $d, $d, 0, 90)
    $gPath.AddArc($offset, $offset + $targetSize - $d, $d, $d, 90, 90)
    $gPath.CloseFigure()

    $g.SetClip($gPath)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()

    $brushBg.Dispose()
    $gPath.Dispose()
    $g.Dispose()

    $bmp.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created maskable: $OutputFile ($Size x $Size)"
}

# Generate PWA & Touch icons
Generate-SquircleIcon -Size 192 -OutputFile "$PSScriptRoot/public/pwa-192x192.png"
Generate-SquircleIcon -Size 512 -OutputFile "$PSScriptRoot/public/pwa-512x512.png"
Generate-MaskableIcon -Size 512 -OutputFile "$PSScriptRoot/public/pwa-maskable-512x512.png"
Generate-SquircleIcon -Size 180 -OutputFile "$PSScriptRoot/public/apple-touch-icon.png"

# Generate favicon sizes
Generate-SquircleIcon -Size 16 -OutputFile "$PSScriptRoot/public/favicon-16x16.png"
Generate-SquircleIcon -Size 32 -OutputFile "$PSScriptRoot/public/favicon-32x32.png"
Generate-SquircleIcon -Size 48 -OutputFile "$PSScriptRoot/public/favicon-48x48.png"
Generate-SquircleIcon -Size 256 -OutputFile "$PSScriptRoot/public/favicon-256x256.png"

$src.Dispose()
