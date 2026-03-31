import os
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, flash, redirect, render_template, request, url_for
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
IMAGES_DIR = STATIC_DIR / "images"

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def create_app() -> Flask:
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", secrets.token_hex(32))
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

    # Ensure images folder exists
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    def is_allowed(filename: str) -> bool:
        ext = Path(filename).suffix.lower()
        return ext in ALLOWED_EXTENSIONS

    def is_valid_image(path: Path) -> bool:
        ext = path.suffix.lower()

        # Allow svg directly
        if ext == ".svg":
            return True

        try:
            # Reject very small files
            if path.stat().st_size < 1024:
                return False
        except OSError:
            return False

        # Trust extension
        return ext in ALLOWED_EXTENSIONS

    def list_images() -> list[str]:
        files = []
        for p in IMAGES_DIR.iterdir():
            if not p.is_file():
                continue
            if p.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue
            if not is_valid_image(p):
                continue
            files.append(p)

        # Sort latest first
        files.sort(key=lambda x: x.stat().st_mtime, reverse=True)

        return [url_for("static", filename=f"images/{p.name}") for p in files]

    def split_hero_and_gallery(image_urls: list[str]):
        hero = []
        gallery = []

        for url in image_urls:
            name = Path(url).name.lower()
            if name.startswith("hero-"):
                hero.append(url)
            else:
                gallery.append(url)

        # Ensure at least 3 hero images
        if len(hero) < 3:
            needed = 3 - len(hero)
            hero = hero + gallery[:needed]
            gallery = gallery[needed:]

        return hero[:5], gallery

    @app.route("/")
    def index():
        image_urls = list_images()
        hero_images, gallery_images = split_hero_and_gallery(image_urls)

        return render_template(
            "index.html",
            business={
                "name": "Veda's Studio",
                "tagline": "From Nails to Threads style unfolds",
                "location": "Sama, Vadodara, India",
                "whatsapp": "https://wa.me/918160413072",
                "instagram": "https://instagram.com/vedasstudio2024",
            },
            hero_images=hero_images,
            gallery_images=gallery_images,
            now_year=datetime.now(timezone.utc).year,
        )

    @app.route("/upload", methods=["POST"])
    def upload():
        files = request.files.getlist("images")

        if not files:
            flash("No files selected.", "error")
            return redirect(url_for("index"))

        saved = 0

        for f in files:
            if not f or not f.filename:
                continue

            original_name = secure_filename(f.filename)
            if not original_name:
                continue

            if not is_allowed(original_name):
                flash(f"Unsupported file type: {original_name}", "error")
                continue

            ext = Path(original_name).suffix.lower()
            unique_name = f"{uuid.uuid4().hex}{ext}"
            out_path = IMAGES_DIR / unique_name

            f.save(out_path)
            saved += 1

        if saved:
            flash(f"{saved} image(s) uploaded successfully.", "success")
        else:
            flash("No images uploaded.", "error")

        return redirect(url_for("index", _anchor="gallery"))

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)