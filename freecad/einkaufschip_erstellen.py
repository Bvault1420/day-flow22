import FreeCAD as App, Part, Sketcher, Draft
from FreeCAD import Vector as V

D = 23.25
R = D / 2
H = 2.33
OUT = "/opt/cursor/artifacts/Einkaufschip.FCStd"

doc = App.newDocument("Einkaufschip")
body = doc.addObject("PartDesign::Body", "Body")
xy = body.Origin.OriginFeatures[3] if body.Origin.OriginFeatures[3].Role == "XY_Plane" else \
    [f for f in body.Origin.OriginFeatures if f.Role == "XY_Plane"][0]


def sketch(name, z=0.0):
    s = body.newObject("Sketcher::SketchObject", name)
    s.AttachmentSupport = [(xy, "")]
    s.MapMode = "FlatFace"
    s.AttachmentOffset = App.Placement(V(0, 0, z), App.Rotation())
    return s


# 1) Chip: Kreis D=23,25 mm auf XY, Extrusion 2,33 mm
s1 = sketch("Skizze_Chip")
s1.addGeometry(Part.Circle(V(0, 0, 0), V(0, 0, 1), R))
s1.addConstraint(Sketcher.Constraint("Coincident", 0, 3, -1, 1))
s1.addConstraint(Sketcher.Constraint("Diameter", 0, D))
pad1 = body.newObject("PartDesign::Pad", "Chip")
pad1.Profile = s1
pad1.Length = H
doc.recompute()

# 2) Vertiefung auf Oberseite: Kreis mit 2,5 mm Abstand zur Außenkante, 0,5 mm tief
s2 = sketch("Skizze_Vertiefung", H)
s2.addGeometry(Part.Circle(V(0, 0, 0), V(0, 0, 1), R - 2.5))
s2.addConstraint(Sketcher.Constraint("Coincident", 0, 3, -1, 1))
s2.addConstraint(Sketcher.Constraint("Diameter", 0, D - 5.0))
pock1 = body.newObject("PartDesign::Pocket", "Vertiefung")
pock1.Profile = s2
pock1.Length = 0.5
doc.recompute()

# 3) Griff: Kreis + Rechteck auf XY, Extrusion bis Oberkante Chip (2,33 mm)
GX, GR, GW = 20.0, 5.0, 10.0
s3 = sketch("Skizze_Griff")
x0, x1, y = R - 1.0, GX, GW / 2
pts = [V(x0, -y, 0), V(x1, -y, 0), V(x1, y, 0), V(x0, y, 0)]
for i in range(4):
    s3.addGeometry(Part.LineSegment(pts[i], pts[(i + 1) % 4]))
for i in range(4):
    s3.addConstraint(Sketcher.Constraint("Coincident", i, 2, (i + 1) % 4, 1))
s3.addConstraint(Sketcher.Constraint("Horizontal", 0))
s3.addConstraint(Sketcher.Constraint("Horizontal", 2))
s3.addConstraint(Sketcher.Constraint("Vertical", 1))
s3.addConstraint(Sketcher.Constraint("Vertical", 3))
pad2 = body.newObject("PartDesign::Pad", "Griff_Rechteck")
pad2.Profile = s3
pad2.Length = H
doc.recompute()

s3b = sketch("Skizze_Griff_Kreis")
s3b.addGeometry(Part.Circle(V(GX, 0, 0), V(0, 0, 1), GR))
s3b.addConstraint(Sketcher.Constraint("Diameter", 0, 2 * GR))
pad3 = body.newObject("PartDesign::Pad", "Griff_Kreis")
pad3.Profile = s3b
pad3.Length = H
doc.recompute()

# 4) Loch für Schlüsselring: Durch alles
s4 = sketch("Skizze_Schluesselring")
s4.addGeometry(Part.Circle(V(GX, 0, 0), V(0, 0, 1), 2.5))
s4.addConstraint(Sketcher.Constraint("Diameter", 0, 5.0))
pock2 = body.newObject("PartDesign::Pocket", "Schluesselring_Loch")
pock2.Profile = s4
pock2.Type = "ThroughAll"
pock2.Reversed = True
doc.recompute()
if pock2.Shape.Volume >= pad3.Shape.Volume - 1e-6:
    pock2.Reversed = False
    doc.recompute()

# Kanten des Lochs abrunden
edges = []
for i, e in enumerate(pock2.Shape.Edges):
    c = getattr(e, "Curve", None)
    if isinstance(c, Part.Circle) and abs(c.Radius - 2.5) < 1e-4:
        edges.append("Edge%d" % (i + 1))
fil = body.newObject("PartDesign::Fillet", "Abrundung")
fil.Base = (pock2, edges)
fil.Radius = 0.5
doc.recompute()

# 5) Text "TEST" auf der Oberfläche (Boden der Vertiefung), 0,5 mm tief
ztop = H - 0.5
ss = Draft.make_shapestring("TEST", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 4.0)
doc.recompute()
bb = ss.Shape.BoundBox
ss.Placement = App.Placement(V(-bb.XLength / 2 - bb.XMin, -bb.YLength / 2 - bb.YMin, 0), App.Rotation())
doc.recompute()
s5 = Draft.make_sketch(ss, autoconstraints=False, name="Skizze_Text")
doc.recompute()
body.addObject(s5)
s5.AttachmentSupport = [(xy, "")]
s5.MapMode = "FlatFace"
s5.AttachmentOffset = App.Placement(V(0, 0, ztop), App.Rotation())
doc.removeObject(ss.Name)
pock3 = body.newObject("PartDesign::Pocket", "Text_TEST")
pock3.Profile = s5
pock3.Length = 0.5
doc.recompute()

for o in doc.Objects:
    if "Invalid" in o.State or "Error" in o.State:
        print("FEHLER:", o.Name, o.State)
print("Volumen:", body.Shape.Volume, "gueltig:", body.Shape.isValid(), "BBox:", body.Shape.BoundBox)
doc.saveAs(OUT)
print("gespeichert", OUT)
