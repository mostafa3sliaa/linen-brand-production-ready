async function check() {
  try {
    const urls = [
      "https://mitsh.vercel.app/images/black-suit.jpg",
      "https://mitsh.vercel.app/images/black-suit-women.jpg",
      "https://mitsh.vercel.app/images/black-women.jpg",
      "https://mitsh.vercel.app/images/hero-main.jpg"
    ];
    for (const u of urls) {
      const res = await fetch(u, { cache: "no-store", method: "HEAD" });
      console.log(u, "->", res.status);
    }
  } catch(e) {
    console.error(e);
  }
}
check();
