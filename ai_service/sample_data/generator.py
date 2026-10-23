"""
Sentry AI - Sample Dataset Generator for Campus CV & Issue Demos
Generates high-contrast synthetic reference images representing campus zones and issues.
"""

import os
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
ZONES_DIR = os.path.join(DATA_DIR, "zones")
ISSUES_DIR = os.path.join(DATA_DIR, "issues")

os.makedirs(ZONES_DIR, exist_ok=True)
os.makedirs(ISSUES_DIR, exist_ok=True)


def create_gradient_canvas(width, height, color1, color2):
    base = Image.new("RGB", (width, height), color1)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return base


def generate_campus_zones():
    # 1. Cafeteria - Morning (dirty) vs Evening (cleaned)
    # Morning: food trays, paper cups, spilled juice
    m_cafe = create_gradient_canvas(640, 480, (210, 195, 170), (160, 140, 120))
    d_m = ImageDraw.Draw(m_cafe)
    # tables
    d_m.rectangle([60, 200, 260, 360], fill=(120, 80, 50), outline=(60, 40, 20), width=4)
    d_m.rectangle([360, 200, 560, 360], fill=(120, 80, 50), outline=(60, 40, 20), width=4)
    # trash on tables and floor
    d_m.ellipse([100, 240, 140, 270], fill=(220, 50, 40)) # cup
    d_m.rectangle([180, 230, 240, 290], fill=(240, 220, 120)) # tray
    d_m.ellipse([190, 240, 230, 280], fill=(180, 90, 30)) # food waste
    d_m.ellipse([270, 390, 340, 430], fill=(100, 40, 20)) # spill
    d_m.rectangle([400, 240, 470, 300], fill=(230, 230, 230)) # wrappers
    d_m.text((20, 20), "CAMERA 01 - ZONE: MAIN CAFETERIA [08:00 AM]", fill=(20, 20, 20))
    m_cafe.save(os.path.join(ZONES_DIR, "cafeteria_morning.jpg"), quality=90)

    # Evening cleaned: tables clear, floor wiped
    e_cafe = create_gradient_canvas(640, 480, (215, 200, 175), (170, 150, 130))
    d_e = ImageDraw.Draw(e_cafe)
    d_e.rectangle([60, 200, 260, 360], fill=(130, 90, 60), outline=(60, 40, 20), width=4)
    d_e.rectangle([360, 200, 560, 360], fill=(130, 90, 60), outline=(60, 40, 20), width=4)
    # clean surface sheen
    d_e.line([(70, 210), (250, 210)], fill=(255, 255, 255), width=2)
    d_e.line([(370, 210), (550, 210)], fill=(255, 255, 255), width=2)
    d_e.text((20, 20), "CAMERA 01 - ZONE: MAIN CAFETERIA [18:00 PM] - POST-CLEAN", fill=(20, 20, 20))
    e_cafe.save(os.path.join(ZONES_DIR, "cafeteria_evening.jpg"), quality=90)

    # 2. Central Courtyard - Static / Unattended (Non-compliant demonstration)
    m_court = create_gradient_canvas(640, 480, (120, 180, 100), (80, 130, 70))
    d_mc = ImageDraw.Draw(m_court)
    d_mc.rectangle([100, 150, 540, 280], fill=(150, 150, 160), outline=(100, 100, 110), width=3) # pathway
    # littered cans and wrappers
    d_mc.ellipse([200, 210, 230, 235], fill=(220, 40, 40))
    d_mc.ellipse([340, 200, 375, 225], fill=(40, 100, 220))
    d_mc.rectangle([420, 215, 460, 240], fill=(255, 255, 100))
    d_mc.text((20, 20), "CAMERA 04 - ZONE: CENTRAL COURTYARD [08:30 AM]", fill=(20, 20, 20))
    m_court.save(os.path.join(ZONES_DIR, "courtyard_morning.jpg"), quality=90)

    # Evening courtyard - litter still there (unchanged / static non-compliance)
    e_court = m_court.copy()
    d_ec = ImageDraw.Draw(e_court)
    d_ec.text((20, 40), "CAMERA 04 - ZONE: CENTRAL COURTYARD [18:30 PM] - UNATTENDED", fill=(20, 20, 20))
    e_court.save(os.path.join(ZONES_DIR, "courtyard_evening.jpg"), quality=90)



def generate_issue_samples():
    # 1. Electrical
    elec = create_gradient_canvas(400, 400, (40, 40, 50), (20, 20, 25))
    d = ImageDraw.Draw(elec)
    # switchboard
    d.rectangle([120, 100, 280, 300], fill=(200, 200, 200), outline=(100, 100, 100), width=3)
    # exposed wires hanging
    d.line([(180, 200), (140, 350)], fill=(220, 30, 30), width=5) # red wire
    d.line([(220, 200), (250, 360)], fill=(30, 30, 30), width=5)  # black wire
    d.line([(200, 200), (190, 370)], fill=(40, 180, 40), width=5) # green wire
    # burn mark
    d.ellipse([170, 160, 230, 220], fill=(50, 40, 30))
    d.text((15, 15), "Exposed Switchboard Wiring", fill=(240, 162, 2))
    elec.save(os.path.join(ISSUES_DIR, "sample_electrical.jpg"), quality=90)

    # 2. Plumbing
    plumb = create_gradient_canvas(400, 400, (180, 190, 200), (130, 145, 160))
    d = ImageDraw.Draw(plumb)
    # pipe
    d.rectangle([60, 150, 340, 210], fill=(100, 110, 120), outline=(70, 80, 90), width=4)
    # crack & water burst
    d.line([(190, 175), (210, 185)], fill=(30, 40, 50), width=3)
    # water puddle
    d.ellipse([80, 280, 320, 370], fill=(70, 130, 190))
    d.ellipse([140, 200, 260, 300], fill=(100, 160, 220)) # spray
    d.text((15, 15), "Corridor Pipe Water Leakage", fill=(79, 209, 197))
    plumb.save(os.path.join(ISSUES_DIR, "sample_plumbing.jpg"), quality=90)

    # 3. Structural Damage
    struct = create_gradient_canvas(400, 400, (200, 195, 185), (160, 155, 145))
    d = ImageDraw.Draw(struct)
    # wall crack zigzag
    d.line([(200, 40), (180, 120), (220, 190), (160, 270), (210, 360)], fill=(60, 50, 40), width=6)
    d.line([(180, 120), (130, 170)], fill=(70, 60, 50), width=3)
    d.line([(220, 190), (270, 230)], fill=(70, 60, 50), width=3)
    d.text((15, 15), "Deep Wall Fissure / Crack", fill=(220, 100, 80))
    struct.save(os.path.join(ISSUES_DIR, "sample_structural.jpg"), quality=90)

    # 4. Cleanliness
    clean = create_gradient_canvas(400, 400, (190, 190, 190), (140, 140, 140))
    d = ImageDraw.Draw(clean)
    # dustbin overflowing
    d.rectangle([130, 180, 270, 360], fill=(40, 120, 40), outline=(20, 60, 20), width=4)
    # trash spilling over
    d.ellipse([100, 140, 160, 190], fill=(240, 220, 80))
    d.ellipse([150, 130, 220, 180], fill=(220, 50, 50))
    d.ellipse([210, 135, 280, 185], fill=(50, 100, 220))
    d.ellipse([80, 330, 150, 380], fill=(120, 80, 40))
    d.ellipse([250, 340, 330, 385], fill=(240, 240, 240))
    d.text((15, 15), "Overflowing Waste Bin", fill=(80, 180, 80))
    clean.save(os.path.join(ISSUES_DIR, "sample_cleanliness.jpg"), quality=90)

    # 5. Equipment Failure
    equip = create_gradient_canvas(400, 400, (60, 65, 75), (35, 40, 45))
    d = ImageDraw.Draw(equip)
    # classroom ceiling projector
    d.rectangle([110, 120, 290, 240], fill=(180, 185, 190), outline=(100, 105, 110), width=3)
    d.ellipse([150, 150, 210, 210], fill=(20, 20, 20), outline=(120, 120, 120), width=2)
    # shattered lens / error indicator
    d.line([(160, 160), (200, 200)], fill=(255, 255, 255), width=2)
    d.line([(160, 200), (200, 160)], fill=(255, 255, 255), width=2)
    d.ellipse([250, 140, 265, 155], fill=(240, 30, 30)) # red error LED
    d.text((15, 15), "Auditorium Projector Breakdown", fill=(200, 200, 220))
    equip.save(os.path.join(ISSUES_DIR, "sample_equipment.jpg"), quality=90)


if __name__ == "__main__":
    generate_campus_zones()
    generate_issue_samples()
    print("Sample dataset generated successfully in ai_service/sample_data/")
