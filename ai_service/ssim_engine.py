"""
Sentry AI - Computer Vision SSIM Maintenance Verification Engine
Compliant with research paper Section 5, 6.5 & Fig. System Workflow

Supports OpenCV & scikit-image when available, with resilient pure-Python/PIL
pipeline ensuring 100% compatibility across any Python installation.
"""

import io
import math
import base64
from PIL import Image, ImageOps, ImageChops, ImageFilter

# Safe imports for optional C-extensions
HAS_NUMPY = False
HAS_OPENCV = False
HAS_SKIMAGE = False

try:
    import numpy as np
    HAS_NUMPY = True
except Exception:
    pass

if HAS_NUMPY:
    try:
        import cv2
        HAS_OPENCV = True
    except Exception:
        pass

    try:
        from skimage.metrics import structural_similarity as ssim_fn
        HAS_SKIMAGE = True
    except Exception:
        pass


def load_image(image_input, target_size=(320, 240)):
    """
    Loads an image from filepath, bytes, or file-like object,
    resizes to target dimensions, and returns PIL RGB and Grayscale images.
    """
    if isinstance(image_input, (bytes, bytearray)):
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, str):
        pil_img = Image.open(image_input).convert("RGB")
    elif hasattr(image_input, "read"):
        pil_img = Image.open(image_input).convert("RGB")
    else:
        raise ValueError("Unsupported image input type")

    pil_img = pil_img.resize(target_size, Image.Resampling.LANCZOS)
    gray_img = pil_img.convert("L").filter(ImageFilter.GaussianBlur(radius=1.2))
    return pil_img, gray_img


def get_image_pixel_list(img):
    if hasattr(img, "get_flattened_data"):
        return list(img.get_flattened_data())
    return list(img.getdata())


def compute_ssim_pil(gray1, gray2, K1=0.01, K2=0.03, L=255.0):
    """
    Calculates Structural Similarity Index (SSIM) between two grayscale PIL images
    using the standard Wang et al. formulation.
    """
    pixels1 = get_image_pixel_list(gray1)
    pixels2 = get_image_pixel_list(gray2)

    n = len(pixels1)

    if n == 0 or len(pixels2) != n:
        return 0.0

    C1 = (K1 * L) ** 2
    C2 = (K2 * L) ** 2

    m1 = sum(pixels1) / n
    m2 = sum(pixels2) / n

    # Variances and covariance
    v1 = sum((x - m1) ** 2 for x in pixels1) / n
    v2 = sum((y - m2) ** 2 for y in pixels2) / n
    cov12 = sum((pixels1[i] - m1) * (pixels2[i] - m2) for i in range(n)) / n

    numerator = (2.0 * m1 * m2 + C1) * (2.0 * cov12 + C2)
    denominator = (m1 ** 2 + m2 ** 2 + C1) * (v1 + v2 + C2)

    if denominator == 0:
        return 1.0

    ssim_val = numerator / denominator
    return max(-1.0, min(1.0, float(ssim_val)))


def generate_heatmap_pil(img1, img2):
    """
    Generates a colorized difference heatmap between two images
    and returns a base64 encoded PNG data URI.
    """
    # Pixel difference
    diff = ImageChops.difference(img1.convert("L"), img2.convert("L"))
    # Enhance difference contrast
    diff_enhanced = ImageOps.autocontrast(diff, cutoff=2)
    
    # Create a 256-color thermal heatmap palette (blue -> cyan -> yellow -> red)
    palette = []
    for i in range(256):
        ratio = i / 255.0
        if ratio < 0.25:
            # Dark blue to cyan
            sub = ratio / 0.25
            r, g, b = int(14 * (1 - sub) + 20 * sub), int(20 * (1 - sub) + 180 * sub), int(40 * (1 - sub) + 220 * sub)
        elif ratio < 0.5:
            # Cyan to green/yellow
            sub = (ratio - 0.25) / 0.25
            r, g, b = int(20 * (1 - sub) + 120 * sub), int(180 * (1 - sub) + 220 * sub), int(220 * (1 - sub) + 40 * sub)
        elif ratio < 0.75:
            # Yellow to orange
            sub = (ratio - 0.5) / 0.25
            r, g, b = int(120 * (1 - sub) + 240 * sub), int(220 * (1 - sub) + 162 * sub), int(40 * (1 - sub) + 10 * sub)
        else:
            # Orange to vivid red/white
            sub = (ratio - 0.75) / 0.25
            r, g, b = int(240 * (1 - sub) + 255 * sub), int(162 * (1 - sub) + 50 * sub), int(10 * (1 - sub) + 30 * sub)
        palette.extend((r, g, b))

    heatmap_img = diff_enhanced.convert("P")
    heatmap_img.putpalette(palette)
    rgb_heatmap = heatmap_img.convert("RGB")

    buffered = io.BytesIO()
    rgb_heatmap.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def analyze_maintenance_pair(morning_input, evening_input, compliance_threshold=0.88, no_change_threshold=0.96):
    """
    Core CV Pipeline for campus maintenance verification.
    Compares morning (scheduled baseline) vs evening (completion checkpoint) images.
    """
    morning_pil, morning_gray = load_image(morning_input)
    evening_pil, evening_gray = load_image(evening_input)

    # Compute SSIM
    if HAS_SKIMAGE and HAS_NUMPY:
        try:
            m_arr = np.array(morning_gray, dtype=np.float32)
            e_arr = np.array(evening_gray, dtype=np.float32)
            score, _ = ssim_fn(m_arr, e_arr, data_range=255.0, full=True)
            score = float(score)
        except Exception:
            score = compute_ssim_pil(morning_gray, evening_gray)
    else:
        score = compute_ssim_pil(morning_gray, evening_gray)

    # Cleanliness delta
    diff_img = ImageChops.difference(morning_gray, evening_gray)
    diff_pixels = get_image_pixel_list(diff_img)
    mean_diff = sum(diff_pixels) / len(diff_pixels)

    cleanliness_delta = round((mean_diff / 255.0) * 100.0, 2)
    similarity_pct = round((score + 1.0) / 2.0 * 100.0, 1)

    # Compliance Evaluation
    if score >= no_change_threshold or cleanliness_delta < 2.0:
        is_compliant = False
        verdict = "NON-COMPLIANT"
        status_message = "ALERT: Scheduled maintenance not detected. Area remained static throughout the day."
        compliance_level = "Critical Alert"
    elif score < 0.25:
        is_compliant = False
        verdict = "INCONCLUSIVE"
        status_message = "WARNING: Scene delta exceeds standard maintenance threshold. Verify camera alignment."
        compliance_level = "Review Required"
    else:
        is_compliant = True
        verdict = "COMPLIANT"
        status_message = "VERIFIED: Physical maintenance confirmed by structural scene delta analysis."
        compliance_level = "Passed"

    heatmap_b64 = generate_heatmap_pil(morning_pil, evening_pil)

    return {
        "ssim_score": round(score, 4),
        "similarity_percentage": similarity_pct,
        "cleanliness_delta_percent": cleanliness_delta,
        "is_compliant": is_compliant,
        "verdict": verdict,
        "compliance_level": compliance_level,
        "status_message": status_message,
        "diff_heatmap": heatmap_b64,
        "parameters": {
            "resolution": "320x240",
            "filter": "GaussianBlur (radius=1.2)",
            "no_change_threshold": no_change_threshold,
            "pipeline": "Structural Similarity Index Measure (SSIM)"
        }
    }
