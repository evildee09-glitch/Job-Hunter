import io
import unittest

import docx

from app.resume_parser import extract_text, parse_resume, parse_skills, split_sections

SAMPLE = """Juan Dela Cruz
juan@example.com | +63 912 345 6789

Summary
Backend developer with Python experience.

Experience
Backend Engineer at Sample Corp
Jan 2022 - Present
- Built REST APIs in Python
- Migrated database to PostgreSQL

Junior Developer, Example Ltd
2020 - 2021
- Maintained a React front end

Education
BS Computer Science
Sample University
2016 - 2020

Skills
Languages: Python, TypeScript, SQL
CI/CD, Docker; PostgreSQL

Certifications
Sample Cloud Practitioner - Example Issuer 2023

Projects
Job tracker app
Personal project to track applications.
"""


class ParserTests(unittest.TestCase):
    def test_sections(self):
        header, sections = split_sections(SAMPLE)
        self.assertEqual(header[0], "Juan Dela Cruz")
        self.assertEqual(set(sections), {"summary", "experience", "education", "skills", "certifications", "projects"})

    def test_contact_and_summary(self):
        r = parse_resume(SAMPLE)
        self.assertEqual(r.name, "Juan Dela Cruz")
        self.assertEqual(r.email, "juan@example.com")
        self.assertIn("912", r.phone)
        self.assertIn("Python", r.summary)

    def test_employment(self):
        r = parse_resume(SAMPLE)
        self.assertEqual(len(r.employment), 2)
        first = r.employment[0]
        self.assertEqual((first["title"], first["company"]), ("Backend Engineer", "Sample Corp"))
        self.assertEqual((first["start"], first["end"]), ("Jan 2022", "Present"))
        self.assertIn("PostgreSQL", first["description"])
        self.assertEqual(r.employment[1]["company"], "Example Ltd")

    def test_education_certs_projects(self):
        r = parse_resume(SAMPLE)
        self.assertEqual(r.education[0]["school"], "Sample University")
        self.assertEqual(r.education[0]["degree"], "BS Computer Science")
        self.assertEqual(r.education[0]["years"], "2016-2020")
        self.assertEqual(r.certifications[0]["year"], "2023")
        self.assertEqual(r.projects[0]["name"], "Job tracker app")

    def test_skills_dedupe_and_filter(self):
        skills = parse_skills(["Languages: Python, python, SQL", "CI/CD; Docker", "This is a very long sentence that is not a skill at all"])
        self.assertEqual(skills, ["Python", "SQL", "CI/CD", "Docker"])

    def test_missing_fields_stay_empty(self):
        r = parse_resume("Skills\nPython\n" + "x" * 40)
        self.assertEqual((r.email, r.phone, r.employment), ("", "", []))

    def test_extract_docx_and_txt(self):
        d = docx.Document()
        for line in SAMPLE.splitlines():
            d.add_paragraph(line)
        buf = io.BytesIO()
        d.save(buf)
        text = extract_text(buf.getvalue(), ".docx")
        self.assertEqual(parse_resume(text).email, "juan@example.com")
        self.assertIn("Backend Engineer", extract_text(SAMPLE.encode(), ".txt"))

    def test_unsupported_extension(self):
        with self.assertRaises(ValueError):
            extract_text(b"x", ".exe")


if __name__ == "__main__":
    unittest.main()
