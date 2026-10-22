Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon {
    param(
        [int]$Size,
        [string]$Path,
        [bool]$IsMaskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Colors
    # Deep Forest Green theme: #0f3923 to #166534
    $cTop = [System.Drawing.Color]::FromArgb(255, 15, 57, 35)
    $cBottom = [System.Drawing.Color]::FromArgb(255, 22, 101, 52)
    $cGold = [System.Drawing.Color]::FromArgb(255, 234, 179, 8) # amber-500
    $cWhite = [System.Drawing.Color]::FromArgb(255, 250, 248, 245) # warm paper white
    $cGreenCheck = [System.Drawing.Color]::FromArgb(255, 74, 222, 128) # green-400

    if ($IsMaskable) {
        # Full bleed background for maskable
        $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
        $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBottom, 45.0)
        $g.FillRectangle($brushBg, $rect)
        $brushBg.Dispose()
    } else {
        # Transparent background, rounded rectangle / squircle for 'any'
        $g.Clear([System.Drawing.Color]::Transparent)
        $pad = [int]($Size * 0.04)
        $rSize = $Size - ($pad * 2)
        $radius = [int]($Size * 0.22)
        
        $pathRounded = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $pathRounded.AddArc($pad, $pad, $d, $d, 180, 90)
        $pathRounded.AddArc($pad + $rSize - $d, $pad, $d, $d, 270, 90)
        $pathRounded.AddArc($pad + $rSize - $d, $pad + $rSize - $d, $d, $d, 0, 90)
        $pathRounded.AddArc($pad, $pad + $rSize - $d, $d, $d, 90, 90)
        $pathRounded.CloseFigure()

        $rect = New-Object System.Drawing.Rectangle($pad, $pad, $rSize, $rSize)
        $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBottom, 45.0)
        $g.FillPath($brushBg, $pathRounded)
        $brushBg.Dispose()
        $pathRounded.Dispose()
    }

    # Center coordinates
    $cx = $Size / 2.0
    $cy = $Size / 2.0

    # Scale factor (maskable needs to be inside 80% safe zone)
    $scale = if ($IsMaskable) { 0.72 } else { 0.88 }

    # Draw circular progress track
    $trackRadius = ($Size * 0.40) * $scale
    $penTrack = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), [float]($Size * 0.024 * $scale))
    $g.DrawEllipse($penTrack, [float]($cx - $trackRadius), [float]($cy - $trackRadius), [float]($trackRadius * 2), [float]($trackRadius * 2))
    $penTrack.Dispose()

    # Draw active progress arc (showing upward growth!)
    $penArc = New-Object System.Drawing.Pen($cGreenCheck, [float]($Size * 0.034 * $scale))
    $penArc.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penArc.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($penArc, [float]($cx - $trackRadius), [float]($cy - $trackRadius), [float]($trackRadius * 2), [float]($trackRadius * 2), -90, 280)
    $penArc.Dispose()

    # Draw Spark/Star dot at end of arc
    $starBrush = New-Object System.Drawing.SolidBrush($cGold)
    $radAngle = (190.0 * [Math]::PI) / 180.0
    $dotX = $cx + $trackRadius * [Math]::Cos($radAngle)
    $dotY = $cy + $trackRadius * [Math]::Sin($radAngle)
    $dotR = [float]($Size * 0.022 * $scale)
    $g.FillEllipse($starBrush, [float]($dotX - $dotR), [float]($dotY - $dotR), [float]($dotR * 2), [float]($dotR * 2))
    $starBrush.Dispose()

    # Draw Typography: "+1%"
    $fontSize = [float]($Size * 0.21 * $scale)
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $brushText = New-Object System.Drawing.SolidBrush($cWhite)
    # Slight upward offset for text to fit checkmark below
    $g.DrawString("+1%", $font, $brushText, [float]$cx, [float]($cy - ($Size * 0.06 * $scale)), $format)
    $brushText.Dispose()
    $font.Dispose()

    # Draw Subtitle or Checkmark icon below "+1%"
    $checkPen = New-Object System.Drawing.Pen($cGreenCheck, [float]($Size * 0.036 * $scale))
    $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $chkY = $cy + ($Size * 0.16 * $scale)
    $p1 = New-Object System.Drawing.PointF([float]($cx - ($Size * 0.10 * $scale)), [float]($chkY))
    $p2 = New-Object System.Drawing.PointF([float]($cx - ($Size * 0.025 * $scale)), [float]($chkY + ($Size * 0.065 * $scale)))
    $p3 = New-Object System.Drawing.PointF([float]($cx + ($Size * 0.11 * $scale)), [float]($chkY - ($Size * 0.075 * $scale)))
    $g.DrawLines($checkPen, @($p1, $p2, $p3))
    $checkPen.Dispose()

    $g.Dispose()

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $Path ($Size x $Size)"
}

function Generate-FaviconPng {
    param(
        [int]$Size,
        [string]$Path
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $cTop = [System.Drawing.Color]::FromArgb(255, 11, 48, 28)
    $cBottom = [System.Drawing.Color]::FromArgb(255, 22, 101, 52)
    $cWhite = [System.Drawing.Color]::FromArgb(255, 250, 248, 245)
    $cGreenCheck = [System.Drawing.Color]::FromArgb(255, 74, 222, 128)

    # Background squircle
    $pad = [int]($Size * 0.05)
    $rSize = $Size - ($pad * 2)
    $radius = [int]($Size * 0.25)
    
    $pathRounded = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $pathRounded.AddArc($pad, $pad, $d, $d, 180, 90)
    $pathRounded.AddArc($pad + $rSize - $d, $pad, $d, $d, 270, 90)
    $pathRounded.AddArc($pad + $rSize - $d, $pad + $rSize - $d, $d, $d, 0, 90)
    $pathRounded.AddArc($pad, $pad + $rSize - $d, $d, $d, 90, 90)
    $pathRounded.CloseFigure()

    $rect = New-Object System.Drawing.Rectangle($pad, $pad, $rSize, $rSize)
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBottom, 45.0)
    $g.FillPath($brushBg, $pathRounded)
    $brushBg.Dispose()
    $pathRounded.Dispose()

    $cx = $Size / 2.0
    $cy = $Size / 2.0

    if ($Size -le 24) {
        # 16x16: Large bold "+1" for supreme clarity in small tab
        $fontSize = [float]($Size * 0.44)
        $font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, $fontSize, [System.Drawing.FontStyle]::Bold)
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $brushText = New-Object System.Drawing.SolidBrush($cWhite)
        $g.DrawString("+1", $font, $brushText, [float]$cx, [float]($cy + 0.5), $format)
        $brushText.Dispose()
        $font.Dispose()
    } elseif ($Size -le 36) {
        # 32x32: "+1%" and sharp checkmark
        $fontSize = [float]($Size * 0.28)
        $font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, $fontSize, [System.Drawing.FontStyle]::Bold)
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $brushText = New-Object System.Drawing.SolidBrush($cWhite)
        $g.DrawString("+1%", $font, $brushText, [float]$cx, [float]($cy - 2.5), $format)
        $brushText.Dispose()
        $font.Dispose()

        $checkPen = New-Object System.Drawing.Pen($cGreenCheck, 2.2)
        $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $p1 = New-Object System.Drawing.PointF(10.5, 23.0)
        $p2 = New-Object System.Drawing.PointF(14.0, 26.5)
        $p3 = New-Object System.Drawing.PointF(21.5, 18.0)
        $g.DrawLines($checkPen, @($p1, $p2, $p3))
        $checkPen.Dispose()
    } else {
        # 48x48 / 64x64: Full detailed icon with progress arc
        $trackRadius = $Size * 0.40
        $penTrack = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), [float]($Size * 0.024))
        $g.DrawEllipse($penTrack, [float]($cx - $trackRadius), [float]($cy - $trackRadius), [float]($trackRadius * 2), [float]($trackRadius * 2))
        $penTrack.Dispose()

        $penArc = New-Object System.Drawing.Pen($cGreenCheck, [float]($Size * 0.035))
        $penArc.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $penArc.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $g.DrawArc($penArc, [float]($cx - $trackRadius), [float]($cy - $trackRadius), [float]($trackRadius * 2), [float]($trackRadius * 2), -90, 280)
        $penArc.Dispose()

        $fontSize = [float]($Size * 0.22)
        $font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, $fontSize, [System.Drawing.FontStyle]::Bold)
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $brushText = New-Object System.Drawing.SolidBrush($cWhite)
        $g.DrawString("+1%", $font, $brushText, [float]$cx, [float]($cy - ($Size * 0.06)), $format)
        $brushText.Dispose()
        $font.Dispose()

        $checkPen = New-Object System.Drawing.Pen($cGreenCheck, [float]($Size * 0.038))
        $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $chkY = $cy + ($Size * 0.16)
        $p1 = New-Object System.Drawing.PointF([float]($cx - ($Size * 0.10)), [float]($chkY))
        $p2 = New-Object System.Drawing.PointF([float]($cx - ($Size * 0.025)), [float]($chkY + ($Size * 0.065)))
        $p3 = New-Object System.Drawing.PointF([float]($cx + ($Size * 0.11)), [float]($chkY - ($Size * 0.075)))
        $g.DrawLines($checkPen, @($p1, $p2, $p3))
        $checkPen.Dispose()
    }

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $Path ($Size x $Size)"
}

Generate-PwaIcon -Size 192 -Path "public/pwa-192x192.png" -IsMaskable $false
Generate-PwaIcon -Size 512 -Path "public/pwa-512x512.png" -IsMaskable $false
Generate-PwaIcon -Size 512 -Path "public/pwa-maskable-512x512.png" -IsMaskable $true
Generate-PwaIcon -Size 180 -Path "public/apple-touch-icon.png" -IsMaskable $false

Generate-FaviconPng -Size 16 -Path "public/favicon-16x16.png"
Generate-FaviconPng -Size 32 -Path "public/favicon-32x32.png"
Generate-FaviconPng -Size 48 -Path "public/favicon-48x48.png"
Generate-FaviconPng -Size 256 -Path "public/favicon-256x256.png"
