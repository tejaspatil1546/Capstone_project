"""
Unit tests for Sentry AI & CV Microservice
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ssim_engine import analyze_maintenance_pair
from classifier_engine import classify_issue_image


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ZONES_DIR = os.path.join(BASE_DIR, "sample_data", "zones")
ISSUES_DIR = os.path.join(BASE_DIR, "sample_data", "issues")


class TestSentryAIService(unittest.TestCase):

    def test_ssim_compliant_case(self):
        m_path = os.path.join(ZONES_DIR, "cafeteria_morning.jpg")
        e_path = os.path.join(ZONES_DIR, "cafeteria_evening.jpg")
        result = analyze_maintenance_pair(m_path, e_path)
        self.assertIn("ssim_score", result)
        self.assertIn("diff_heatmap", result)
        self.assertTrue(result["diff_heatmap"].startswith("data:image/png;base64,"))
        self.assertTrue(result["is_compliant"])
        self.assertEqual(result["verdict"], "COMPLIANT")
        print(f"Cafeteria SSIM Score: {result['ssim_score']}, Verdict: {result['verdict']}")

    def test_ssim_non_compliant_case(self):
        m_path = os.path.join(ZONES_DIR, "courtyard_morning.jpg")
        e_path = os.path.join(ZONES_DIR, "courtyard_evening.jpg")
        result = analyze_maintenance_pair(m_path, e_path)
        self.assertIn("ssim_score", result)
        # Should be detected as unattended / non-compliant
        self.assertFalse(result["is_compliant"])
        self.assertEqual(result["verdict"], "NON-COMPLIANT")
        print(f"Courtyard SSIM Score: {result['ssim_score']}, Verdict: {result['verdict']}")

    def test_classifier_electrical(self):
        img_path = os.path.join(ISSUES_DIR, "sample_electrical.jpg")
        result = classify_issue_image(img_path, description_hint="Exposed wire sparking near lab")
        self.assertEqual(result["predicted_category"], "Electrical")
        self.assertIn("Electrical Maintenance Squad", result["assigned_team"])
        print(f"Electrical classification: {result['predicted_category']}, confidence: {result['confidence']}%")

    def test_classifier_plumbing(self):
        img_path = os.path.join(ISSUES_DIR, "sample_plumbing.jpg")
        result = classify_issue_image(img_path, description_hint="Water pipe leakage and puddle")
        self.assertEqual(result["predicted_category"], "Plumbing")
        self.assertIn("Plumbing", result["assigned_team"])
        print(f"Plumbing classification: {result['predicted_category']}, confidence: {result['confidence']}%")


if __name__ == "__main__":
    unittest.main()
